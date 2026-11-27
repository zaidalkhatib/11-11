/** Pure helpers: map API profile/answers into mobile Answers (no React Native). */
import type { AnswersSnapshot, Catalog, Profile } from "./contracts/client.ts";
import { conversations, emptyAnswers, type Answers } from "./onboarding.ts";

/** Provisional DOB from age trait — adult check only, not identity verification. */
export function provisionalDobFromAge(ageLabel: string | undefined): string | null {
  if (!ageLabel) return null;
  const age = Number(ageLabel);
  if (!Number.isInteger(age) || age < 18 || age > 120) return null;
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

function labelsFor(catalog: Catalog, questionId: string, choices: string[]): string[] {
  const question = catalog.questions.find((q) => q.id === questionId);
  if (!question) return [];
  return choices
    .map((id) => question.options.find((o) => o.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function hydrateAnswersFromServer(
  catalog: Catalog,
  profile: Profile,
  snapshot: AnswersSnapshot,
  phone: string,
): Answers {
  const answers = emptyAnswers();
  answers.name = profile.displayName.trim();
  answers.phone = phone;
  answers.photoUri = profile.photoUrl?.trim() || "";
  answers.city = "San Diego";
  const raw = snapshot.answers ?? {};
  const energyLabels = labelsFor(catalog, "energy", raw.energy?.choices ?? []);
  const energyNum = Number(energyLabels[0] ?? raw.energy?.choices?.[0] ?? "");
  answers.energy = Number.isInteger(energyNum) && energyNum >= 1 && energyNum <= 5 ? energyNum : null;
  const topics = labelsFor(catalog, "conversations", raw.conversations?.choices ?? []);
  answers.conversations = topics.filter((t) => (conversations as readonly string[]).includes(t));
  const traits: Record<string, string[]> = {};
  for (const question of catalog.questions) {
    if (question.id === "energy" || question.id === "conversations" || question.id === "chemistry") continue;
    const answer = raw[question.id];
    if (!answer || answer.status !== "ANSWERED" || !answer.choices?.length) continue;
    const labels = labelsFor(catalog, question.id, answer.choices);
    if (labels.length) traits[question.id] = labels;
  }
  answers.traits = traits;
  return answers;
}
