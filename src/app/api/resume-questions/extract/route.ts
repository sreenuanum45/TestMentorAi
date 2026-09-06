import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { fileBase64, mimeType } = (await req.json()) as {
      fileBase64?: string;
      mimeType?: string;
    };
    if (!fileBase64 || !mimeType) {
      return NextResponse.json(
        { error: "fileBase64 and mimeType are required" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(fileBase64, "base64");

    let text: string;
    if (mimeType === "application/pdf") {
      // Importing the package root ("pdf-parse") triggers its bundled debug-mode
      // check (`!module.parent`), which under Next.js's module system always
      // reads true and tries to load a nonexistent test fixture file. Importing
      // the internal implementation directly skips that broken check.
      const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (mimeType === DOCX_MIME) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Couldn't extract any text from that file — try pasting it instead" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.slice(0, 15000) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse file" },
      { status: 500 }
    );
  }
}
