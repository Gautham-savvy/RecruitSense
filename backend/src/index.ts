import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { clerkAuth } from "./middleware/auth";
import jobRoutes from "./routes/jobs";
import candidateRoutes from "./routes/candidates";
import pipelineRoutes from "./routes/pipeline";
import analyticsRoutes from "./routes/analytics";
import { startScoreWorker } from "./workers/scoreWorker";

const app = express();
const httpServer = createServer(app);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://recruit-sense.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

export const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true },
});

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(clerkAuth);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/jobs", jobRoutes);
app.use("/candidates", candidateRoutes);
app.use("/pipeline", pipelineRoutes);
app.use("/analytics", analyticsRoutes);

// Global error handler — logs the real error to terminal
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ SERVER ERROR:", err.message);
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

io.on("connection", (socket) => {
  socket.on("join:job", (jobId: string) => {
    socket.join(`job_${jobId}`);
  });
});

startScoreWorker();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
