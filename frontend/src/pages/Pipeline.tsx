import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Kanban, Loader2, StickyNote, X, Check } from "lucide-react";
import { getPipeline, updateStage, updateNotes, getJobs } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STAGES = [
  { key: "SHORTLISTED",          label: "Shortlisted",          accent: "#3b82f6" },
  { key: "INTERVIEW_SCHEDULED",  label: "Interview Scheduled",  accent: "#8b5cf6" },
  { key: "INTERVIEWED",          label: "Interviewed",          accent: "#f59e0b" },
  { key: "OFFER_SENT",           label: "Offer Sent",           accent: "#f97316" },
  { key: "HIRED",                label: "Hired",                accent: "#10b981" },
];

type Candidate = { id: string; name: string; stage: string; notes?: string; score?: { overallScore: number } };

function CandidateCard({ candidate, onMove }: { candidate: Candidate; onMove: (stage: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(candidate.notes ?? "");
  const qc = useQueryClient();

  const saveNote = useMutation({
    mutationFn: () => updateNotes(candidate.id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pipeline"] }); setEditing(false); },
  });

  return (
    <div
      className="rounded-xl p-3 transition-shadow"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px var(--shadow)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
          style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}
        >
          {candidate.name[0].toUpperCase()}
        </div>
        <Link
          to={`/candidates/${candidate.id}`}
          className="text-sm font-medium truncate flex-1 transition-colors"
          style={{ color: "var(--text-1)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-1)")}
        >
          {candidate.name}
        </Link>
        {candidate.score && <ScoreBadge score={Math.round(candidate.score.overallScore)} size="sm" />}
      </div>

      <Select value={candidate.stage} onValueChange={onMove}>
        <SelectTrigger
          className="h-7 text-xs mt-1"
          style={{ background: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-1)" }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          {STAGES.map((s) => <SelectItem key={s.key} value={s.key} className="text-xs">{s.label}</SelectItem>)}
          <SelectItem value="REJECTED" className="text-xs text-red-500">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {editing ? (
        <div className="mt-2 space-y-1">
          <Textarea
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
            rows={2}
            className="text-xs resize-none"
            style={{ background: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-1)" }}
            placeholder="Add note..."
          />
          <div className="flex gap-1">
            <button
              className="h-6 px-2 rounded text-xs flex items-center transition-opacity hover:opacity-80"
              style={{ background: "var(--btn-primary)", color: "var(--btn-primary-fg)" }}
              onClick={() => saveNote.mutate()}
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              className="h-6 px-2 rounded text-xs flex items-center transition-opacity hover:opacity-70"
              style={{ color: "var(--text-2)" }}
              onClick={() => setEditing(false)}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="mt-2 flex items-center gap-1 text-xs transition-colors"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
        >
          <StickyNote className="w-3 h-3" />
          {candidate.notes ? <span className="truncate">{candidate.notes}</span> : "Add note"}
        </button>
      )}
    </div>
  );
}

export default function Pipeline() {
  const qc = useQueryClient();
  const [jobId, setJobId] = useState<string>("");

  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: getJobs });
  const { data: pipeline, isLoading } = useQuery({
    queryKey: ["pipeline", jobId],
    queryFn: () => getPipeline(jobId),
    enabled: !!jobId,
  });

  const move = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => updateStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipeline"] }),
  });

  return (
    <div className="max-w-full px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-1)" }}>
              <Kanban className="w-6 h-6" style={{ color: "var(--accent)" }} /> Hiring Pipeline
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>Track candidates across hiring stages</p>
          </div>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger
              className="w-56"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-1)" }}
            >
              <SelectValue placeholder="Select a job..." />
            </SelectTrigger>
            <SelectContent style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              {jobs.map((j: { id: string; title: string }) => (
                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!jobId ? (
          <div
            className="p-16 text-center rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <Kanban className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-3)" }} />
            <p style={{ color: "var(--text-3)" }}>Select a job to view the pipeline</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-5"
            style={{ scrollbarWidth: "thin" }}>
            {STAGES.map((stage) => {
              const candidates: Candidate[] = pipeline?.[stage.key] ?? [];
              return (
                <div
                  key={stage.key}
                  className="rounded-xl p-3 min-h-96 min-w-64 md:min-w-0 shrink-0 md:shrink"
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderTop: `2px solid ${stage.accent}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>{stage.label}</h3>
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-medium"
                      style={{ background: "var(--bg-card)", color: "var(--text-2)" }}
                    >
                      {candidates.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {candidates.map((c) => (
                      <CandidateCard key={c.id} candidate={c} onMove={(s) => move.mutate({ id: c.id, stage: s })} />
                    ))}
                    {candidates.length === 0 && (
                      <p className="text-xs text-center pt-8" style={{ color: "var(--text-3)" }}>No candidates</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
