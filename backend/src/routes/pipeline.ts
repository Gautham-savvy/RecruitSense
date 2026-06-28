import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

type PipelineStage =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "OFFER_SENT"
  | "HIRED"
  | "REJECTED";

const VALID_STAGES: PipelineStage[] = [
  "APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED",
  "INTERVIEWED", "OFFER_SENT", "HIRED", "REJECTED",
];

function qs(val: unknown): string | undefined {
  return typeof val === "string" ? val : undefined;
}

router.get("/", requireAuth, async (req, res) => {
  const jobId = qs(req.query.jobId);

  const candidates = await prisma.candidate.findMany({
    where: jobId ? { jobPostId: jobId } : {},
    include: { score: true },
    orderBy: { updatedAt: "desc" },
  });

  const grouped = VALID_STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<PipelineStage, typeof candidates>);

  res.json(grouped);
});

router.patch("/:id/stage", requireAuth, async (req, res) => {
  const stage = (req.body as { stage: PipelineStage }).stage;

  if (!VALID_STAGES.includes(stage)) {
    res.status(400).json({ error: "Invalid stage" });
    return;
  }

  const candidate = await prisma.candidate.update({
    where: { id: String(req.params.id) },
    data: { stage },
    include: { score: true },
  });

  res.json(candidate);
});

router.patch("/:id/notes", requireAuth, async (req, res) => {
  const notes = (req.body as { notes: string }).notes;

  const candidate = await prisma.candidate.update({
    where: { id: String(req.params.id) },
    data: { notes },
  });

  res.json(candidate);
});

export default router;
