import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConceptProgress, StudyPack } from "./types";

type StudyState = {
  packs: Record<string, StudyPack>;
  progress: Record<string, ConceptProgress>;
  recents: string[];
  savePack: (pack: StudyPack) => void;
  appendQuestions: (slug: string, pack: StudyPack) => void;
  touchProgress: (slug: string, title: string, patch?: Partial<ConceptProgress>) => void;
  clearAll: () => void;
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      packs: {},
      progress: {},
      recents: [],
      savePack: (pack) =>
        set((state) => ({
          packs: { ...state.packs, [pack.slug]: pack },
          recents: [pack.slug, ...state.recents.filter((s) => s !== pack.slug)].slice(0, 12),
          progress: {
            ...state.progress,
            [pack.slug]: state.progress[pack.slug] ?? {
              slug: pack.slug,
              title: pack.title,
              cardsReviewed: 0,
              questionsAttempted: 0,
              questionsCorrect: 0,
              masteryScore: null,
              lastStudied: Date.now(),
            },
          },
        })),
      appendQuestions: (slug, pack) =>
        set((state) => ({
          packs: { ...state.packs, [slug]: pack },
        })),
      touchProgress: (slug, title, patch) =>
        set((state) => {
          const prev = state.progress[slug] ?? {
            slug,
            title,
            cardsReviewed: 0,
            questionsAttempted: 0,
            questionsCorrect: 0,
            masteryScore: null,
            lastStudied: Date.now(),
          };
          return {
            progress: {
              ...state.progress,
              [slug]: { ...prev, title, lastStudied: Date.now(), ...patch },
            },
            recents: [slug, ...state.recents.filter((s) => s !== slug)].slice(0, 12),
          };
        }),
      clearAll: () => set({ packs: {}, progress: {}, recents: [] }),
    }),
    { name: "studania-v1" },
  ),
);
