import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, Brain, Loader2, FileDown } from "lucide-react";
import { getCandidate, generateQuestions } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StatusBadge } from "@/components/StatusBadge";

const typeColor: Record<string, { bg: string; text: string }> = {
  TECHNICAL:   { bg: "var(--bg-subtle)", text: "var(--accent)" },
  BEHAVIOURAL: { bg: "var(--bg-subtle)", text: "var(--accent-2)" },
  CULTURE_FIT: { bg: "#dcfce7", text: "#166534" },
};

const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  boxShadow: "0 2px 12px var(--shadow)",
};

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidate(id!),
  });

  const genQ = useMutation({
    mutationFn: () => generateQuestions(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", id] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
    </div>
  );

  const score = candidate?.score;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to={`/jobs/${candidate?.jobPostId}/candidates`}
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-2)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
      </Link>

      {/* Header Card */}
      <div className="p-6 rounded-2xl mb-5" style={card}>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0"
            style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}
          >
            {candidate?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>{candidate?.name}</h1>
              <StatusBadge status={candidate?.status} />
            </div>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>{candidate?.jobPost?.title}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {score && <ScoreBadge score={Math.round(score.overallScore)} size="lg" />}
            {candidate?.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                style={{ background: "var(--bg-subtle)", color: "var(--accent)", border: "1px solid var(--border)" }}
              >
                <FileDown className="w-3.5 h-3.5" /> View Resume
              </a>
            )}
          </div>
        </div>
      </div>

      {score && (
        <>
          {/* Score breakdown */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-5">
            {[
              { label: "Skills",     value: score.skillsScore },
              { label: "Experience", value: score.experienceScore },
              { label: "Education",  value: score.educationScore },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 text-center rounded-2xl" style={card}>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>{label}</p>
                <ScoreBadge score={Math.round(value)} size="md" />
              </div>
            ))}
          </div>

          {/* AI Assessment */}
          <div className="p-5 rounded-2xl mb-5" style={card}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <h3 className="font-semibold" style={{ color: "var(--text-1)" }}>AI Assessment</h3>
            </div>
            <p className="leading-relaxed text-sm" style={{ color: "var(--text-2)" }}>{score.reasoning}</p>
          </div>

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="p-5 rounded-2xl" style={card}>
              <h3 className="font-semibold flex items-center gap-2 mb-3" style={{ color: "var(--text-1)" }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
              </h3>
              <div className="space-y-2">
                {score.strengths.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-2)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl" style={card}>
              <h3 className="font-semibold flex items-center gap-2 mb-3" style={{ color: "var(--text-1)" }}>
                <XCircle className="w-4 h-4 text-red-500" /> Gaps
              </h3>
              <div className="space-y-2">
                {score.gaps.map((g: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-2)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {g}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Interview Questions */}
      <div className="p-5 rounded-2xl" style={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--text-1)" }}>
            <Sparkles className="w-4 h-4 text-amber-500" /> Interview Questions
          </h3>
          {(!candidate?.interviewQuestions || candidate.interviewQuestions.length === 0) && (
            <button
              onClick={() => genQ.mutate()}
              disabled={genQ.isPending}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--btn-primary)", color: "var(--btn-primary-fg)" }}
            >
              {genQ.isPending
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                : <><Sparkles className="w-3 h-3" /> Generate</>}
            </button>
          )}
        </div>
        {!candidate?.interviewQuestions || candidate.interviewQuestions.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-3)" }}>
            Click Generate to create personalized interview questions
          </p>
        ) : (
          <div className="space-y-3">
            {candidate.interviewQuestions.map((q: { id: string; order: number; type: string; question: string }) => (
              <div key={q.id} className="flex gap-3 p-3 rounded-xl" style={{ background: "var(--bg-subtle)" }}>
                <span className="text-xs font-bold w-5 shrink-0 mt-0.5" style={{ color: "var(--text-3)" }}>#{q.order}</span>
                <div className="flex-1">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1.5"
                    style={{ background: typeColor[q.type]?.bg ?? "var(--bg-subtle)", color: typeColor[q.type]?.text ?? "var(--text-2)" }}
                  >
                    {q.type.replace("_", " ")}
                  </span>
                  <p className="text-sm" style={{ color: "var(--text-1)" }}>{q.question}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
