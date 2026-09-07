export interface CodeLanguage {
  id: string;
  label: string;
  judge0Id: number;
  monacoId: string;
  template: string;
  commentPrefix: string;
}

export const CODE_LANGUAGES: CodeLanguage[] = [
  {
    id: "python",
    label: "Python",
    judge0Id: 92, // Python 3.11.2
    monacoId: "python",
    template: 'print("Hello, TestMentor AI!")\n',
    commentPrefix: "#",
  },
  {
    id: "javascript",
    label: "JavaScript",
    judge0Id: 93, // Node.js 18.15.0
    monacoId: "javascript",
    template: 'console.log("Hello, TestMentor AI!");\n',
    commentPrefix: "//",
  },
  {
    id: "typescript",
    label: "TypeScript",
    judge0Id: 94, // TypeScript 5.0.3
    monacoId: "typescript",
    template: 'const message: string = "Hello, TestMentor AI!";\nconsole.log(message);\n',
    commentPrefix: "//",
  },
  {
    id: "java",
    label: "Java",
    judge0Id: 91, // JDK 17.0.6
    monacoId: "java",
    template:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, TestMentor AI!");\n    }\n}\n',
    commentPrefix: "//",
  },
  {
    id: "cpp",
    label: "C++",
    judge0Id: 54, // GCC 9.2.0
    monacoId: "cpp",
    template:
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, TestMentor AI!" << endl;\n    return 0;\n}\n',
    commentPrefix: "//",
  },
  {
    id: "c",
    label: "C",
    judge0Id: 50, // GCC 9.2.0
    monacoId: "c",
    template:
      '#include <stdio.h>\n\nint main() {\n    printf("Hello, TestMentor AI!\\n");\n    return 0;\n}\n',
    commentPrefix: "//",
  },
];

export function getCodeLanguage(id: string): CodeLanguage | undefined {
  return CODE_LANGUAGES.find((l) => l.id === id);
}
