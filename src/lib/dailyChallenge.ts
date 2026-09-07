export interface DailyChallengeQuestion {
  id: string;
  question: string;
  category: string;
}

export const DAILY_CHALLENGE_POOL: DailyChallengeQuestion[] = [
  { id: "dc-1", question: "What's the difference between smoke testing and sanity testing?", category: "Manual Testing" },
  { id: "dc-2", question: "How do you decide what to automate vs. keep manual in a test suite?", category: "Automation Strategy" },
  { id: "dc-3", question: "Explain the difference between PUT and PATCH in REST APIs.", category: "API Testing" },
  { id: "dc-4", question: "What is flaky test, and how would you diagnose one in a CI pipeline?", category: "CI/CD" },
  { id: "dc-5", question: "How does explicit wait differ from implicit wait in Selenium/Playwright?", category: "Automation" },
  { id: "dc-6", question: "What's the difference between load testing and stress testing?", category: "Performance Testing" },
  { id: "dc-7", question: "How would you test a search feature with pagination and sorting?", category: "Manual Testing" },
  { id: "dc-8", question: "What's the Page Object Model, and why is it used in test automation?", category: "Automation Framework" },
  { id: "dc-9", question: "How do you validate a JSON response schema in API testing?", category: "API Testing" },
  { id: "dc-10", question: "What is boundary value analysis, and how would you apply it to an age input field?", category: "Test Design" },
  { id: "dc-11", question: "How do you handle authentication tokens when writing automated API tests?", category: "API Testing" },
  { id: "dc-12", question: "What's the difference between a regression suite and a full test suite?", category: "Test Strategy" },
  { id: "dc-13", question: "How would you test a file upload feature that accepts PDF and DOCX?", category: "Manual Testing" },
  { id: "dc-14", question: "Explain how you'd design a data-driven test for a login form.", category: "Automation Framework" },
  { id: "dc-15", question: "What's the difference between a bug, a defect, and an error?", category: "QA Fundamentals" },
  { id: "dc-16", question: "How do you test for SQL injection vulnerabilities manually?", category: "Security Testing" },
  { id: "dc-17", question: "What's the difference between horizontal and vertical scalability, from a testing perspective?", category: "Performance Testing" },
  { id: "dc-18", question: "How would you approach testing a feature flag rollout to 10% of users?", category: "Test Strategy" },
  { id: "dc-19", question: "What's the role of a test data management strategy in a CI/CD pipeline?", category: "Test Data" },
  { id: "dc-20", question: "Explain equivalence partitioning with an example from a checkout form.", category: "Test Design" },
  { id: "dc-21", question: "How do you handle dynamic locators (IDs that change on every page load)?", category: "Automation" },
  { id: "dc-22", question: "What's the difference between a mock, a stub, and a spy in testing?", category: "Automation Fundamentals" },
  { id: "dc-23", question: "How would you test an API that returns paginated results?", category: "API Testing" },
  { id: "dc-24", question: "What is contract testing, and when would you use it over end-to-end tests?", category: "API Testing" },
  { id: "dc-25", question: "How do you prioritize test cases when you only have limited time before a release?", category: "Test Strategy" },
  { id: "dc-26", question: "What's the difference between white-box, black-box, and gray-box testing?", category: "QA Fundamentals" },
  { id: "dc-27", question: "How would you write a test plan for a brand-new feature with no existing documentation?", category: "Test Strategy" },
  { id: "dc-28", question: "What's a race condition, and how would you try to catch one through testing?", category: "Manual Testing" },
  { id: "dc-29", question: "How do you decide the right level of parallelization for a large automation suite?", category: "CI/CD" },
  { id: "dc-30", question: "What's the difference between functional and non-functional testing? Give three examples of each.", category: "QA Fundamentals" },
];

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodaysChallenge(): DailyChallengeQuestion {
  const index = dayOfYear(new Date()) % DAILY_CHALLENGE_POOL.length;
  return DAILY_CHALLENGE_POOL[index];
}
