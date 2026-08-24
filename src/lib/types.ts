export type Flashcard = {
  front: string;
  back: string;
};

export type PracticeQuestion = {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
  misconceptionIfWrong: string;
};

export type Misconception = {
  myth: string;
  truth: string;
};

export type StudyPack = {
  slug: string;
  title: string;
  summary: string;
  explanation: string[];
  keyPoints: string[];
  examples: { title: string; body: string }[];
  misconceptions: Misconception[];
  related: string[];
  flashcards: Flashcard[];
  questions: PracticeQuestion[];
  generatedAt: number;
};

export type ConceptProgress = {
  slug: string;
  title: string;
  cardsReviewed: number;
  questionsAttempted: number;
  questionsCorrect: number;
  masteryScore: number | null;
  lastStudied: number;
};

export type TeachbackResult = {
  score: number;
  verdict: "mastered" | "partial" | "needs_work";
  covered: string[];
  missing: string[];
  feedback: string;
  nextHint: string;
};

export type Diagnosis = {
  diagnosis: string;
  likelyMisconception: string;
  microLesson: string;
};
