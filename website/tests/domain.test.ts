import assert from 'node:assert/strict';
import test from 'node:test';
import { experiences, energies, createPreview, getExperience } from '../packages/domain/index.ts';
import { tokens } from '../packages/design-tokens/index.ts';
test('every preview is one-to-one and explicitly a concept', () => { for (const experience of experiences) for (const energy of energies) { const result = createPreview({experience: experience.id, energy}); assert.equal(result.partySize, 2); assert.equal(result.status, 'concept'); assert.equal(result.energy, energy); assert.equal(result.id, experience.id); } });
test('unknown experience falls back safely', () => assert.equal(getExperience('bad-id').id, 'dinner'));
test('unique experience ids and complete display copy', () => { assert.equal(new Set(experiences.map(x=>x.id)).size, experiences.length); for(const item of experiences) assert.ok(item.label && item.description && item.detail && item.invitation); });
test('portable design tokens use primitives and accessible touch target', () => { assert.ok(tokens.accessibility.minimumTarget >= 44); for(const value of Object.values(tokens.color)) assert.match(value, /^#[a-f0-9]{6}$/i); assert.ok(tokens.motion.quick < tokens.motion.reveal); });
