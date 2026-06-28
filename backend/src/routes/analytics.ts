import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { getAuth } from "@clerk/express";
import { Candidate, Score } from "../../generated/prisma/client";

const router = Router();

type CandidateWithScore = Candidate & { score: Score | null };

// GET /analytics?jobId= — dashboard metrics
router.get("/", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const jobId = req.query.jobId as string | undefined;

  const user = await prisma.user.findUnique({ where: { clerkId: userId! } });
  if (!user) { res.json({}); return; }

  const jobFilter = jobId
    ? { jobPostId: jobId }
    : { jobPost: { userId: user.id } };

  const candidates: CandidateWithScore[] = await prisma.candidate.findMany({
    where: jobFilter,
    include: { score: true },
  });

  const buckets = [
    { range: "0-20", min: 0, max: 20 },
    { range: "21-40", min: 21, max: 40 },
    { range: "41-60", min: 41, max: 60 },
    { range: "61-80", min: 61, max: 80 },
    { range: "81-100", min: 81, max: 100 },
  ];

  const scoreDistribution = buckets.map((b) => ({
    range: b.range,
    count: candidates.filter(
      (c) => c.score && c.score.overallScore >= b.min && c.score.overallScore <= b.max
    ).length,
  }));

  const stages = ["APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED", "OFFER_SENT", "HIRED"];
  const pipelineFunnel = stages.map((stage) => ({
    stage,
    count: candidates.filter((c) => c.stage === stage).length,
  }));

  const scoredCandidates = candidates.filter((c) => c.score);
  const avgScore =
    scoredCandidates.length > 0
      ? scoredCandidates.reduce((sum, c) => sum + c.score!.overallScore, 0) / scoredCandidates.length
      : 0;

  res.json({
    totalCandidates: candidates.length,
    scoredCandidates: scoredCandidates.length,
    avgScore: Math.round(avgScore * 10) / 10,
    scoreDistribution,
    pipelineFunnel,
  });
});

export default router;
