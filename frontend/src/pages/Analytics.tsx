import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, Users, TrendingUp, CheckCircle2, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getAnalytics, getJobs } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FUNNEL_COLORS = ["var(--accent)", "var(--accent-2)", "#a78bfa", "#c4b5fd", "#818cf8", "#6366f1"];

export default function Analytics() {
  const [jobId, setJobId] = useState<string>("all");
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: getJobs });

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", jobId],
    queryFn: () => getAnalytics(jobId === "all" ? undefined : jobId),
  });

  const statCards = [
    { label: "Total Candidates", value: data?.totalCandidates ?? 0, icon: Users },
    { label: "Scored", value: data?.scoredCandidates ?? 0, icon: CheckCircle2 },
    { label: "Avg Score", value: data?.avgScore ?? 0, icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-1)" }}>
            <BarChart3 className="w-6 h-6" style={{ color: "var(--accent)" }} /> Analytics
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>Hiring insights and pipeline metrics</p>
        </div>
        <Select value={jobId} onValueChange={setJobId}>
          <SelectTrigger
            className="w-56"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-1)" }}
          >
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((j: { id: string; title: string }) => (
              <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {statCards.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="p-5 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px var(--shadow)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--bg-subtle)" }}
                  >
                    <Icon className="w-6 h-6" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>{label}</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--text-1)" }}>{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <div
              className="p-5 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px var(--shadow)" }}
            >
              <h3 className="font-semibold mb-5" style={{ color: "var(--text-1)" }}>Score Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.scoreDistribution ?? []} barSize={36}>
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: "var(--text-2)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-2)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}
                    labelStyle={{ color: "var(--text-2)" }}
                    cursor={{ fill: "var(--bg-subtle)" }}
                  />
                  <Bar dataKey="count" name="Candidates" radius={[6, 6, 0, 0]} fill="var(--accent)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pipeline Funnel */}
            <div
              className="p-5 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px var(--shadow)" }}
            >
              <h3 className="font-semibold mb-5" style={{ color: "var(--text-1)" }}>Pipeline Funnel</h3>
              <div className="space-y-2">
                {(data?.pipelineFunnel ?? []).map((item: { stage: string; count: number }, i: number) => {
                  const max = Math.max(...(data?.pipelineFunnel ?? []).map((f: { count: number }) => f.count), 1);
                  const pct = (item.count / max) * 100;
                  return (
                    <div key={item.stage} className="flex items-center gap-3">
                      <span className="text-xs w-36 shrink-0" style={{ color: "var(--text-2)" }}>{item.stage.replace(/_/g, " ")}</span>
                      <div className="flex-1 rounded-full h-5 overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
                        <div
                          className="h-full rounded-full flex items-center px-2 transition-all duration-700"
                          style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: FUNNEL_COLORS[i] ?? "var(--accent)" }}
                        >
                          <span className="text-white text-xs font-medium">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
