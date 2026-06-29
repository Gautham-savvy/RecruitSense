import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  onUpload: (files: FileList) => void;
  loading?: boolean;
}

export function FileDropzone({ onUpload, loading }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<File[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      setSelected(Array.from(files));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const newFiles = Array.from(e.target.files);
      setSelected(prev => {
        const existingNames = new Set(prev.map(f => f.name));
        const unique = newFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...unique];
      });
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!selected.length) return;
    const dt = new DataTransfer();
    selected.forEach((f) => dt.items.add(f));
    onUpload(dt.files);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer",
          dragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
            : "border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          className="hidden"
          onChange={handleChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
            dragging ? "bg-indigo-100 dark:bg-indigo-900" : "bg-slate-100 dark:bg-slate-800"
          )}>
            <Upload className={cn("w-6 h-6", dragging ? "text-indigo-600" : "text-slate-400")} />
          </div>
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              Drop resumes here or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>PDF, DOCX or TXT — up to 20 files, 10MB each</p>
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{selected.length} file(s) selected</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {selected.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate text-slate-700 dark:text-slate-300 flex-1">{f.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelected((s) => s.filter((_, j) => j !== i)); }}>
                  <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? "Uploading..." : `Upload ${selected.length} Resume${selected.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
