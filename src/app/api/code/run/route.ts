import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCodeLanguage } from "@/lib/codeLanguages";

const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status: { id: number; description: string };
}

/**
 * The execution service always compiles Java as Main.java, regardless of the
 * requested file name — so a user's own public class name causes a
 * "should be declared in a file named X.java" compile error. Rename the
 * public class (and any self-references to it) to "Main" transparently,
 * the same trick most online judges use, so users can name their class
 * whatever they want in the editor.
 */
function normalizeJavaSource(code: string): string {
  const match = code.match(/public\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
  if (!match || match[1] === "Main") return code;
  const className = match[1];
  return code.replace(new RegExp(`\\b${className}\\b`, "g"), "Main");
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { languageId, code, stdin } = (await req.json()) as {
      languageId?: string;
      code?: string;
      stdin?: string;
    };

    const lang = languageId ? getCodeLanguage(languageId) : undefined;
    if (!lang) return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const source_code = lang.id === "java" ? normalizeJavaSource(code) : code;

    const res = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code,
        language_id: lang.judge0Id,
        stdin: typeof stdin === "string" ? stdin : "",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Execution service error (${res.status}): ${text.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as Judge0Result;
    return NextResponse.json({
      stdout: data.stdout ?? "",
      stderr: data.stderr ?? "",
      compileOutput: data.compile_output ?? "",
      message: data.message ?? "",
      time: data.time,
      memory: data.memory,
      status: data.status,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
