/** No browser or native dependencies. Safe to import into a future Expo app. */
export const experiences = [
  { id: 'dinner', label: 'A table for two', short: 'Dinner', eyebrow: 'SOMETHING SLOW', description: 'A tucked-away table. A conversation that forgets the time.', detail: 'A relaxed dinner somewhere intimate, with room for the conversation to find its own rhythm.', invitation: 'Stay for one more story.' },
  { id: 'wander', label: 'The scenic route', short: 'A little adventure', eyebrow: 'SOMETHING UNEXPECTED', description: 'A new corner of the city. Someone new to get lost with.', detail: 'A gentle wander, a little discovery, and a good reason to put your phone away.', invitation: 'Take the long way together.' },
  { id: 'create', label: 'A little chemistry', short: 'Something creative', eyebrow: 'SOMETHING PLAYFUL', description: 'Make something imperfect. Start something unexpected.', detail: 'A hands-on creative experience, where a little curiosity is all you need to bring.', invitation: 'Make room for a happy accident.' },
] as const;
export type ExperienceId = typeof experiences[number]['id'];
export const energies = ['Quiet & curious', 'Playful & spontaneous', 'A little of both'] as const;
export type Energy = typeof energies[number];
export type PreviewPreferences = { experience: ExperienceId; energy: Energy };
export function getExperience(id: string) { return experiences.find(item => item.id === id) ?? experiences[0]; }
/** This is a presentation selection, not a compatibility algorithm or real booking. */
export function createPreview(preferences: PreviewPreferences) {
  return { ...getExperience(preferences.experience), energy: preferences.energy, partySize: 2 as const, status: 'concept' as const };
}
