// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
import mammoth from "mammoth";

export async function parseResume(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text.trim();
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (mimetype === "text/plain") {
    return buffer.toString("utf-8").trim();
  }

  throw new Error("Unsupported file type. Upload a PDF, DOCX, or TXT.");
}
