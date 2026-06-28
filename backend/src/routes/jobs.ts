import { Router } from "express";
import { getAuth } from "@clerk/express";
import multer from "multer";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { parseResume } from "../services/fileParser";
import { scoreQueue } from "../workers/scoreWorker";
import { uploadResume } from "../lib/cloudinaryUpload";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", requireAuth, async (req, res) => {
  const { userId, orgId } = getAuth(req);

  const jobs = await prisma.jobPost.findMany({
    where: orgId
      ? { OR: [{ orgId }, { user: { clerkId: userId! }, orgId: null }] }
      : { user: { clerkId: userId! } },
    include: { _count: { select: { candidates: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(jobs);
});

router.post("/", requireAuth, async (req, res) => {
  const { userId, orgId } = getAuth(req);
  const body = req.body as { title?: string; department?: string; description?: string; email?: string; name?: string };

  if (!body.title || !body.description) {
    res.status(400).json({ error: "title and description are required" });
    return;
  }

  let user = await prisma.user.findUnique({ where: { clerkId: userId! } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId: userId!, email: body.email ?? "", name: body.name },
    });
  }

  const job = await prisma.jobPost.create({
    data: {
      title: body.title,
      department: body.department,
      description: body.description,
      userId: user.id,
      ...(orgId ? { orgId } : {}),
    },
  });

  res.status(201).json(job);
});

router.get("/:id", requireAuth, async (req, res) => {
  const job = await prisma.jobPost.findUnique({
    where: { id: String(req.params.id) },
    include: {
      candidates: { include: { score: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(job);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await prisma.jobPost.delete({ where: { id: String(req.params.id) } });
  res.json({ success: true });
});

router.post("/:id/upload", requireAuth, upload.array("resumes", 20), async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];
    console.log("📤 Upload hit, files:", files?.length);
    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const jobPostId = String(req.params.id);
    const results = [];

    for (const file of files) {
      console.log("📄 Parsing file:", file.originalname, file.mimetype);
      const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
      const resumeText = await parseResume(file.buffer, file.mimetype);
      console.log("✅ Parsed, text length:", resumeText.length);

      let resumeUrl: string | undefined;
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name") {
          resumeUrl = await uploadResume(file.buffer, `${jobPostId}_${nameWithoutExt}`);
        }
      } catch { /* continue without cloud storage */ }

      const candidate = await prisma.candidate.create({
        data: { name: nameWithoutExt, resumeText, jobPostId, status: "PENDING", ...(resumeUrl ? { resumeUrl } : {}) },
      });
      console.log("✅ Candidate created:", candidate.id);

      await scoreQueue.add("score", { candidateId: candidate.id, jobPostId });
      console.log("✅ Queued for scoring");
      results.push({ id: candidate.id, name: candidate.name });
    }

    res.status(201).json({ queued: results.length, candidates: results });
  } catch (err) {
    console.error("❌ UPLOAD ERROR:", (err as Error).message);
    console.error((err as Error).stack);
    next(err);
  }
});

export default router;
