export function buildMcqExamPrompt(focus: string, numQuestions: number): string {
  return `You are "TestMentor AI"'s exam generator. Create ${numQuestions} challenging multiple-choice QA engineering interview questions focused on: ${focus}.

Each question must have exactly 4 options with exactly one correct answer, and a one-sentence explanation of why the correct answer is right. Vary difficulty and cover different sub-topics within the focus area — do not ask near-duplicate questions.

Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{"questions": [{"question": "string", "options": ["string", "string", "string", "string"], "correctIndex": 0, "explanation": "string"}]}`;
}

export function buildShortAnswerExamPrompt(focus: string, numQuestions: number): string {
  return `You are "TestMentor AI"'s exam generator. Create ${numQuestions} challenging open-ended QA engineering interview questions focused on: ${focus}. Each must require a real, specific technical answer (never a yes/no question). Cover different sub-topics — do not ask near-duplicate questions.

Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{"questions": [{"question": "string"}]}`;
}

export const SHORT_ANSWER_GRADING_PROMPT = `You are "TestMentor AI"'s exam grader. You will be given a list of QA engineering interview questions paired with a candidate's written answers. For EACH question, grade the answer on a 0-5 scale (5 = excellent and technically precise, 0 = blank or completely wrong), write a one-sentence feedback note explaining the score, and a one-sentence model answer.

Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{"results": [{"score": 0, "feedback": "string", "modelAnswer": "string"}]}
Return results in the exact same order as the questions were given, one result per question.`;
