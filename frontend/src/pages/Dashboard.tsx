import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Briefcase, Users, Trash2, ChevronRight, Search, Sparkles, UserPlus } from "lucide-react";
import { getJobs, createJob, deleteJob } from "@/lib/api";
import { OrganizationProfile, useOrganization, CreateOrganization } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Job = {
  id: string;
  title: string;
  department?: string;
  isActive: boolean;
  description: string;
  _count: { candidates: number };
  createdAt: string;
};

export default function Dashboard() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", department: "", description: "" });

  const { data: jobs = [], isLoading } = useQuery({ queryKey: ["jobs"], queryFn: getJobs, retry: false });

  const create = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      setOpen(false);
      setForm({ title: "", department: "", description: "" });
    },
  });

  const remove = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const { organization } = useOrganization();
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  const filtered = jobs.filter((j: Job) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>

      {/* ── Header ── */}
      <div className="px-4 pt-10 pb-6" style={{ background: "var(--bg-page)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3"
              style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}
            >
              <Sparkles className="w-3 h-3" /> AI-Powered Hiring
            </span>
            <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-1)" }}>Job Posts</h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Manage open positions and screen resumes with AI
            </p>
          </div>

          {/* Stats */}
          <div className="hidden md:flex gap-4">
            {[
              { label: "Total Jobs", value: jobs.length },
              { label: "Active", value: jobs.filter((j: Job) => j.isActive).length },
              { label: "Candidates", value: jobs.reduce((s: number, j: Job) => s + j._count.candidates, 0) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="text-center px-5 py-3 rounded-2xl"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
              >
                <p className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="max-w-7xl mx-auto px-4">

        {/* Search + New Job bar */}
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job posts..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-1)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs px-2.5 py-1 rounded-lg font-medium"
              style={{ color: "var(--accent)", background: "var(--bg-subtle)" }}
            >
              clear
            </button>
          )}
          <div className="w-px h-6 mx-1" style={{ background: "var(--border)" }} />

          <button
            onClick={() => organization ? setShowOrgModal(true) : setShowCreateOrg(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ border: "1px solid var(--border)", color: "var(--text-2)", background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{organization ? organization.name : "Team"}</span>
          </button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--btn-primary)", color: "var(--btn-primary-fg)" }}
              >
                <Plus className="w-4 h-4" /> New Job Post
              </button>
            </DialogTrigger>
            <DialogContent
              className="border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                boxShadow: "0 24px 64px var(--shadow)",
              }}
            >
              <DialogHeader>
                <DialogTitle style={{ color: "var(--text-1)" }}>Create Job Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label style={{ color: "var(--text-2)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Job Title *
                    </Label>
                    <Input
                      placeholder="e.g. Senior Engineer"
                      value={form.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, title: e.target.value }))}
                      style={{ background: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-1)" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label style={{ color: "var(--text-2)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Department
                    </Label>
                    <Input
                      placeholder="e.g. Engineering"
                      value={form.department}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, department: e.target.value }))}
                      style={{ background: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-1)" }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "var(--text-2)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Job Description *
                  </Label>
                  <Textarea
                    placeholder="Describe the role, requirements, responsibilities..."
                    rows={6}
                    value={form.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="resize-none"
                    style={{ background: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-1)" }}
                  />
                </div>
                <button
                  onClick={() => create.mutate(form)}
                  disabled={!form.title || !form.description || create.isPending}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50"
                  style={{ background: "var(--btn-primary)", color: "var(--btn-primary-fg)" }}
                >
                  {create.isPending ? "Creating..." : "Create Job Post"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-2xl animate-pulse"
                style={{ background: "var(--bg-subtle)" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (

          /* ── Empty State ── */
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background: "var(--bg-card)",
              border: "2px dashed var(--border)",
              boxShadow: "0 4px 24px var(--shadow)",
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
            >
              <Briefcase className="w-9 h-9" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-1)" }}>
              {search ? "No jobs match your search" : "No job posts yet"}
            </h3>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "var(--text-2)" }}>
              {search
                ? "Try a different search term"
                : "Create your first job post and start screening resumes with AI"}
            </p>
            {!search && (
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "var(--btn-primary)", color: "var(--btn-primary-fg)" }}
              >
                <Plus className="w-4 h-4" /> Create Your First Job
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((job: Job) => (
              <div
                key={job.id}
                className="group rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 12px var(--shadow)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 12px 40px var(--shadow)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 2px 12px var(--shadow)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Top accent stripe */}
                <div className="h-0.5" style={{ background: "var(--card-stripe)" }} />

                <div className="p-5">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
                    >
                      <Briefcase className="w-5 h-5" style={{ color: "var(--accent)" }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={job.isActive
                          ? { background: "var(--bg-subtle)", color: "var(--accent)" }
                          : { background: "var(--border)", color: "var(--text-3)" }
                        }
                      >
                        {job.isActive ? "Active" : "Closed"}
                      </span>
                      <button
                        onClick={() => remove.mutate(job.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
                        style={{ color: "var(--text-3)", background: "transparent" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                          (e.currentTarget as HTMLButtonElement).style.background = "#ef444415";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & dept */}
                  <h3 className="font-bold text-base mb-0.5 line-clamp-1" style={{ color: "var(--text-1)" }}>
                    {job.title}
                  </h3>
                  {job.department && (
                    <p className="text-xs font-medium mb-3" style={{ color: "var(--accent)" }}>{job.department}</p>
                  )}

                  {/* Description preview */}
                  <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--text-2)" }}>
                    {job.description}
                  </p>

                  {/* Candidates pill */}
                  <div
                    className="flex items-center gap-2 py-2.5 px-3 rounded-xl mb-4"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
                  >
                    <Users className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                      {job._count.candidates}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-2)" }}>
                      candidate{job._count.candidates !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/jobs/${job.id}`} className="flex-1">
                      <button
                        className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{ border: "1px solid var(--border)", color: "var(--text-2)", background: "transparent" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        Upload Resumes
                      </button>
                    </Link>
                    <Link to={`/jobs/${job.id}/candidates`}>
                      <button
                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
                        style={{ background: "var(--btn-primary)", color: "var(--btn-primary-fg)" }}
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="h-12" />
      </div>

      {/* Org Profile modal */}
      {showOrgModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowOrgModal(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <OrganizationProfile routing="hash" />
          </div>
        </div>
      )}

      {/* Create Org modal */}
      {showCreateOrg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowCreateOrg(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <CreateOrganization routing="hash" afterCreateOrganizationUrl="/dashboard" />
          </div>
        </div>
      )}
    </div>
  );
}
