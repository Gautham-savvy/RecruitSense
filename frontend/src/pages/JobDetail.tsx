import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ArrowLeft, Users, Loader2, Trash2 } from "lucide-react";
import { getJob, uploadResumes, deleteCandidate } from "@/lib/api";
import { FileDropzone } from "@/components/FileDropzone";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreBadge } from "@/components/ScoreBadge";
import { useSocket } from "@/hooks/useSocket";
export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id!),
    refetchInterval: 5000,
  });

  const onScored = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["job", id] });
  }, [qc, id]);

  useSocket(id, onScored);

  const upload = useMutation({
    mutationFn: (files: FileList) => uploadResumes(id!, files),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job", id] }),
  });

  const remove = useMutation({
    mutationFn: (candidateId: string) => deleteCandidate(candidateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job", id] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
    </div>
  );

  const candidates = job?.candidates ?? [];
  const processing = candidates.filter((c: { status: string }) => c.status === "PROCESSING" || c.status === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-2)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload */}
        <div className="lg:col-span-1 space-y-4">
          <div
            className="p-5 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px var(--shadow)" }}
          >
            <h2 className="font-semibold mb-1" style={{ color: "var(--text-1)" }}>{job?.title}</h2>
            {job?.department && <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>{job.department}</p>}
            <p className="text-base line-clamp-4 mb-4 leading-relaxed" style={{ color: "var(--text-2)" }}>{job?.description}</p>
            <div
              className="flex items-center gap-2 text-sm pt-3 border-t"
              style={{ borderColor: "var(--border)", color: "var(--text-2)" }}
            >
              <Users className="w-4 h-4" />
              <span>{candidates.length} candidates total</span>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px var(--shadow)" }}
          >
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-1)" }}>Upload Resumes</h3>
            <FileDropzone onUpload={(files) => upload.mutate(files)} loading={upload.isPending} />
            {upload.isSuccess && (
              <p className="text-sm text-emerald-600 mt-3 text-center">
                Resumes uploaded — AI scoring in progress
              </p>
            )}
          </div>
        </div>

        {/* Right: Candidates */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "var(--text-1)" }}>
              Candidates {processing > 0 && (
                <span
                  className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ color: "var(--accent)", background: "var(--bg-subtle)" }}
                >
                  {processing} scoring...
                </span>
              )}
            </h3>
            {candidates.length > 0 && (
              <Link to={`/jobs/${id}/candidates`}>
                <button
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: "var(--btn-primary)", color: "var(--btn-primary-fg)" }}
                >
                  View Leaderboard
                </button>
              </Link>
            )}
          </div>

          <div className="space-y-2">
            {candidates.length === 0 ? (
              <div
                className="p-12 text-center rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <p style={{ color: "var(--text-3)" }}>Upload resumes to see candidates here</p>
              </div>
            ) : (
              candidates.map((c: { id: string; name: string; status: string; score?: { overallScore: number } }) => (
                <div
                  key={c.id}
                  className="group p-4 rounded-2xl flex items-center gap-4 transition-all"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px var(--shadow)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  <Link to={`/candidates/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                      style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}
                    >
                      {c.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: "var(--text-1)" }}>{c.name}</p>
                    </div>
                  </Link>
                  <StatusBadge status={c.status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"} />
                  {c.score && <ScoreBadge score={Math.round(c.score.overallScore)} size="sm" />}
                  <button
                    onClick={() => { if (confirm(`Delete ${c.name}?`)) remove.mutate(c.id); }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    style={{ color: "var(--text-3)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                    title="Delete candidate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
