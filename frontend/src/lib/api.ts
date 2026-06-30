import axios from "axios";

let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = _getToken ? await _getToken() : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Jobs
export const getJobs = () => api.get("/jobs").then((r) => r.data);
export const createJob = (data: { title: string; department?: string; description: string }) =>
  api.post("/jobs", data).then((r) => r.data);
export const getJob = (id: string) => api.get(`/jobs/${id}`).then((r) => r.data);
export const deleteJob = (id: string) => api.delete(`/jobs/${id}`).then((r) => r.data);
export const uploadResumes = (jobId: string, files: FileList) => {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append("resumes", f));
  return api.post(`/jobs/${jobId}/upload`, form).then((r) => r.data);
};
export const rescoreJob = (jobId: string) =>
  api.post(`/jobs/${jobId}/rescore`).then((r) => r.data);

// Candidates
export const getCandidates = (params: Record<string, string>) =>
  api.get("/candidates", { params }).then((r) => r.data);
export const getCandidate = (id: string) => api.get(`/candidates/${id}`).then((r) => r.data);
export const deleteCandidate = (id: string) => api.delete(`/candidates/${id}`).then((r) => r.data);
export const generateQuestions = (id: string) =>
  api.post(`/candidates/${id}/questions`).then((r) => r.data);

// Pipeline
export const getPipeline = (jobId: string) =>
  api.get("/pipeline", { params: { jobId } }).then((r) => r.data);
export const updateStage = (id: string, stage: string) =>
  api.patch(`/pipeline/${id}/stage`, { stage }).then((r) => r.data);
export const updateNotes = (id: string, notes: string) =>
  api.patch(`/pipeline/${id}/notes`, { notes }).then((r) => r.data);

// Analytics
export const getAnalytics = (jobId?: string) =>
  api.get("/analytics", { params: jobId ? { jobId } : {} }).then((r) => r.data);
