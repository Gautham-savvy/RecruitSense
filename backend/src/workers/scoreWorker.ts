import { Worker, Queue } from "bullmq";
import prisma from "../lib/prisma";
import { scoreResume } from "../services/aiService";
import { sendApplicationReceived } from "../services/emailService";
import { io } from "../index";

function extractEmail(text: string): string | null {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : null;
}

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const url = new URL(REDIS_URL);
const connection = {
  host: url.hostname,
  port: parseInt(url.port) || 6379,
  ...(url.password ? { password: url.password } : {}),
  ...(url.username && url.username !== "default" ? { username: url.username } : {}),
};

export const scoreQueue = new Queue("score-resume", { connection });

export function startScoreWorker() {
  const worker = new Worker(
    "score-resume",
    async (job) => {
      const { candidateId, jobPostId } = job.data as { candidateId: string; jobPostId: string };

      await prisma.candidate.update({
        where: { id: candidateId },
        data: { status: "PROCESSING" },
      });

      const candidate = await prisma.candidate.findUniqueOrThrow({
        where: { id: candidateId },
      });

      const jobPost = await prisma.jobPost.findUniqueOrThrow({
        where: { id: jobPostId },
      });

      const result = await scoreResume(
        candidate.resumeText || "",
        jobPost.description
      );

      await prisma.score.create({
        data: {
          candidateId,
          overallScore: result.overallScore,
          skillsScore: result.skillsScore,
          experienceScore: result.experienceScore,
          educationScore: result.educationScore,
          reasoning: result.reasoning,
          strengths: result.strengths,
          gaps: result.gaps,
        },
      });

      const email = extractEmail(candidate.resumeText ?? "");
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { status: "COMPLETED", stage: "SHORTLISTED", ...(email ? { email } : {}) },
      });

      if (email) {
        sendApplicationReceived(candidate.name, email, jobPost.title).catch(() => {});
      }

      io.to(`job_${jobPostId}`).emit("candidate:scored", { candidateId });
    },
    { connection }
  );

  worker.on("failed", async (job, err) => {
    if (job) {
      await prisma.candidate.update({
        where: { id: job.data.candidateId },
        data: { status: "FAILED" },
      });
    }
    console.error("Score job failed:", err.message);
  });

  return worker;
}
