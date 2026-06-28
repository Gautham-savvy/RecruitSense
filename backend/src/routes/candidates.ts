import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { generateQuestions } from "../services/aiService";

const router = Router();

function qs(val: unknown): string | undefined {
  return typeof val === "string" ? val : undefined;
}

router.get("/", requireAuth, async (req, res) => {
  const jobId = qs(req.query.jobId);
  const minScore = qs(req.query.minScore);
  const maxScore = qs(req.query.maxScore);
  const search = qs(req.query.search);

  const candidates = await prisma.candidate.findMany({
    where: {
      ...(jobId ? { jobPostId: jobId } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(minScore || maxScore
        ? {
            score: {
              overallScore: {
                ...(minScore ? { gte: Number(minScore) } : {}),
                ...(maxScore ? { lte: Number(maxScore) } : {}),
              },
            },
          }
        : {}),
    },
    include: { score: true },
    orderBy: { score: { overallScore: "desc" } },
  });

  res.json(candidates);
});

router.get("/:id", requireAuth, async (req, res) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id: String(req.params.id) },
    include: {
      score: true,
      interviewQuestions: { orderBy: { order: "asc" } },
      jobPost: true,
    },
  });
  if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }
  res.json(candidate);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await prisma.candidate.delete({ where: { id: String(req.params.id) } });
  res.json({ success: true });
});

router.post("/:id/questions", requireAuth, async (req, res) => {
  const raw = await prisma.candidate.findUnique({
    where: { id: String(req.params.id) },
    include: { jobPost: true, interviewQuestions: true },
  });

  if (!raw) { res.status(404).json({ error: "Candidate not found" }); return; }

  // Prisma 7 include types need explicit narrowing
  const candidate = raw as typeof raw & {
    jobPost: { description: string };
    interviewQuestions: { id: string }[];
  };

  if (candidate.interviewQuestions.length > 0) {
    res.json(candidate.interviewQuestions);
    return;
  }

  const questions = await generateQuestions(
    candidate.resumeText || "",
    candidate.jobPost.description
  );

  const created = await prisma.interviewQuestion.createManyAndReturn({
    data: questions.map((q) => ({
      candidateId: candidate.id,
      question: q.question,
      type: q.type,
      order: q.order,
    })),
  });

  res.status(201).json(created);
});

export default router;
