export interface CodingProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
}

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "Easy",
    prompt:
      "Print numbers 1 to 100. For multiples of 3 print \"Fizz\", for multiples of 5 print \"Buzz\", for multiples of both print \"FizzBuzz\".",
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    prompt: "Write a function that reverses a string without using a built-in reverse method.",
  },
  {
    id: "palindrome",
    title: "Palindrome Check",
    difficulty: "Easy",
    prompt: "Write a function that checks whether a given string is a palindrome (ignoring case and spaces).",
  },
  {
    id: "count-vowels",
    title: "Count Vowels",
    difficulty: "Easy",
    prompt: "Write a function that counts the number of vowels in a given string.",
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Medium",
    prompt:
      "Given an array of integers and a target value, return the indices of the two numbers that add up to the target.",
  },
  {
    id: "remove-duplicates",
    title: "Remove Duplicates",
    difficulty: "Medium",
    prompt: "Write a function that removes duplicate values from an array while preserving order.",
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Medium",
    prompt: "Implement binary search on a sorted array of integers, returning the index of a target value or -1.",
  },
  {
    id: "fibonacci",
    title: "Fibonacci Sequence",
    difficulty: "Medium",
    prompt: "Write a function that returns the nth Fibonacci number, using either recursion with memoization or iteration.",
  },
  {
    id: "is-prime",
    title: "Prime Number Check",
    difficulty: "Easy",
    prompt: "Write a function that determines whether a given integer is a prime number.",
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray Sum",
    difficulty: "Hard",
    prompt: "Given an array of integers, find the contiguous subarray with the largest sum (Kadane's algorithm).",
  },
];
