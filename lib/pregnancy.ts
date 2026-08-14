import { differenceInDays, addDays } from "date-fns";
import type { PregnancyInfo } from "./types";

const BABY_DATA: { week: number; size: string; weight: string; fruit: string }[] = [
  { week: 8, size: "1.6 cm", weight: "1g", fruit: "a Raspberry" },
  { week: 12, size: "5.4 cm", weight: "14g", fruit: "a Plum" },
  { week: 16, size: "11.6 cm", weight: "100g", fruit: "an Avocado" },
  { week: 20, size: "16.4 cm", weight: "300g", fruit: "a Banana" },
  { week: 24, size: "21.5 cm", weight: "650g", fruit: "a Mango" },
  { week: 28, size: "25.4 cm", weight: "1kg", fruit: "an Eggplant" },
  { week: 32, size: "28.9 cm", weight: "1.7kg", fruit: "a Squash" },
  { week: 36, size: "32.2 cm", weight: "2.6kg", fruit: "a Papaya" },
  { week: 40, size: "36.2 cm", weight: "3.4kg", fruit: "a Watermelon" },
];

function getBabyData(weeks: number) {
  const match = [...BABY_DATA].reverse().find((d) => weeks >= d.week);
  return match || BABY_DATA[0];
}

export function hasPregnancyData(dueDate?: string, lmpDate?: string): boolean {
  return !!(dueDate || lmpDate);
}

export function getPregnancyInfo(dueDate?: string, lmpDate?: string): PregnancyInfo | null {
  if (!hasPregnancyData(dueDate, lmpDate)) {
    return null;
  }

  const today = new Date();
  let startDate: Date;

  if (lmpDate) {
    startDate = new Date(lmpDate);
  } else if (dueDate) {
    startDate = addDays(new Date(dueDate), -280);
  } else {
    return null;
  }

  const totalDays = Math.max(0, differenceInDays(today, startDate));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const progress = Math.min(100, Math.round((totalDays / 280) * 100));
  const baby = getBabyData(weeks);

  return {
    weeks,
    days,
    totalDays,
    progress,
    babySize: baby.size,
    babyWeight: baby.weight,
    fruitComparison: baby.fruit,
  };
}

export const TRIMESTER_TIPS: Record<number, { title: string; tip: string; insight: string }> = {
  1: {
    title: "First Trimester",
    tip: "Stay hydrated and take your prenatal vitamins daily.",
    insight: "Your baby's heart is beginning to beat. Rest when you need to.",
  },
  2: {
    title: "Second Trimester",
    tip: "You may feel baby kicks soon! Track them with our Kick Counter.",
    insight: "Baby can hear your voice. Talk and sing to your little one.",
  },
  3: {
    title: "Third Trimester",
    tip: "Pack your hospital bag and finalize your birth plan.",
    insight: "Baby is gaining weight rapidly. Eat nutritious meals and stay active.",
  },
};

export function getTrimester(weeks: number): 1 | 2 | 3 {
  if (weeks < 13) return 1;
  if (weeks < 27) return 2;
  return 3;
}
