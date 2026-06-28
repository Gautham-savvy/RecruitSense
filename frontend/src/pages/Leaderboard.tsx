import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Search, SlidersHorizontal, Trophy, Loader2, Download } from "lucide-react";
import { getCandidates, getJob } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const stageColors: Record<string, { bg: string; text: string }> = {
  APPLIED:              { bg: "var(--bg-subtle)", text: "var(--text-2)" },
  SHORTLISTED:          { bg: "var(--bg-subtle)", text: "var(--accent)" },
  INTERVIEW_SCHEDULED:  { bg: "var(--bg-subtle)", text: "var(--accent-2)" },
  INTERVIEWED:          { bg: "var(--bg-subtle)", text: "var(--accent)" },
  OFFER_SENT:           { bg: "var(--bg-subtle)", text: "var(--accent-2)" },
  HIRED:                { bg: "#dcfce7", text: "#166534" },
  REJECTED:             { bg: "#fee2e2", text: "#991b1b" },
};

export default function Leaderboard() {
  const { id: jobId } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState("0");

  const exportCSV = () => {
    if (!candidates.length) return;
    const rows = [
      ["Rank", "Name", "Overall Score", "Stage", "Status"],
      ...candidates.map((c: { name: string; stage: string; status: string; score?: { overallScore: number } }, i: number) => [
        i + 1, c.name, c.score ? Math.round(c.score.overallScore) : "—", c.stage.replace(/_/g, " "), c.status,
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${job?.title ?? "candidates"}-shortlist.csv`;
    a.click();
  };

  const { data: job } = useQuery({ queryKey: ["job", jobId], queryFn: () => getJob(jobId!) });

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates", jobId, search, minScore],
    queryFn: () => getCandidates({ jobId: jobId!, ...(search ? { search } : {}), ...(minScore !== "0" ? { minScore } : {}) }),
    refetchInterval: 5000,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to={`/jobs/${jobId}`}
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-2)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Job
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-1)" }}>
            <Trophy className="w-6 h-6 text-amber-500" /> Candidate Leaderboard
          </h1>
          {job && <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>{job.title}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm px-3 py-1 rounded-full font-semibold" style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}>
            {candidates.length} candidates
          </span>
          {candidates.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "var(--btn-primary)", color: "var(--btn-primary-fg)" }}
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
          <Input
            placeholder="Search candidates..."
            className="pl-9"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-1)" }}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <Select value={minScore} onValueChange={setMinScore}>
          <SelectTrigger
            className="w-44"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-1)" }}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" style={{ color: "var(--text-3)" }} />
            <SelectValue placeholder="Min Score" />
          </SelectTrigger>
          <SelectContent style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <SelectItem value="0">All Scores</SelectItem>
            <SelectItem value="40">40+ Score</SelectItem>
            <SelectItem value="60">60+ Score</SelectItem>
            <SelectItem value="80">80+ Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px var(--shadow)" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-3)" }}>No candidates found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Rank", "Candidate", "Score", "Stage", "Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.map((c: { id: string; name: string; status: string; stage: string; score?: { overallScore: number } }, i: number) => (
                  <Link key={c.id} to={`/candidates/${c.id}`} className="contents">
                    <tr
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : ""}`}
                          style={i > 2 ? { color: "var(--text-3)" } : {}}
                        >
                          #{i + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
                            style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}
                          >
                            {c.name[0].toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: "var(--text-1)" }}>{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {c.score ? <ScoreBadge score={Math.round(c.score.overallScore)} size="md" /> : <span style={{ color: "var(--text-3)" }}>—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: stageColors[c.stage]?.bg ?? "var(--bg-subtle)", color: stageColors[c.stage]?.text ?? "var(--text-2)" }}
                        >
                          {c.stage.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={c.status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"} />
                      </td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
