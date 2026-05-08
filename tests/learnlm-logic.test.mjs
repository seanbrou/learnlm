import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addGeneratedUnitsToState,
  initialState,
  resolveUnitId,
  reviewFlashcardInState,
  migrateState,
  fisherYatesOrder,
} from '../src/lib/learnlm-logic.ts';

test('resolveUnitId supports exact ids and friendly aliases like u2 inside a notebook', () => {
  assert.equal(resolveUnitId(initialState, 'nb1_u2'), 'nb1_u2');
  assert.equal(resolveUnitId(initialState, 'u2', 'nb1'), 'nb1_u2');
  assert.equal(resolveUnitId(initialState, '2', 'nb1'), 'nb1_u2');
  assert.equal(resolveUnitId(initialState, 'missing', 'nb1'), undefined);
});

test('generated units always become complete learning objects with subunits, flashcards, quiz, and exam questions', () => {
  const before = initialState;
  const after = addGeneratedUnitsToState(before, 'nb1', {
    units: [{ title: 'Photosynthesis', overview: 'Light energy into chemical energy', subunits: [{ title: 'Light Reactions', content: 'Thylakoids make ATP and NADPH.' }] }],
  }, 1700000000000);
  const unit = after.units.find((u) => u.title === 'Photosynthesis');
  assert.ok(unit, 'generated unit exists');
  const subunits = after.subunits.filter((s) => s.unitId === unit._id);
  const flashcards = after.flashcards.filter((f) => f.unitId === unit._id);
  const quizzes = after.questions.filter((q) => q.unitId === unit._id && q.type !== 'exam');
  const exams = after.questions.filter((q) => q.unitId === unit._id && q.type === 'exam');
  assert.ok(subunits.length >= 1, 'subunits generated');
  assert.ok(flashcards.length >= subunits.length, 'flashcards generated');
  assert.ok(quizzes.length >= subunits.length, 'quiz questions generated');
  assert.ok(exams.length >= 1, 'exam questions generated');
});

test('SM-2 review updates due date, repetitions, ease, and mastery immutably', () => {
  const card = initialState.flashcards[0];
  const reviewed = reviewFlashcardInState(initialState, card.id, 5, 1700000000000);
  const updated = reviewed.flashcards.find((f) => f.id === card.id);
  assert.notEqual(reviewed, initialState);
  assert.equal(updated.repetitions, card.repetitions + 1);
  assert.ok(updated.nextReview > 1700000000000);
  assert.ok(updated.mastery > card.mastery);
});

test('fisherYatesOrder returns a deterministic permutation when a random source is injected', () => {
  const order = fisherYatesOrder(5, () => 0);
  assert.deepEqual([...order].sort((a, b) => a - b), [0, 1, 2, 3, 4]);
  assert.equal(new Set(order).size, 5);
  assert.notDeepEqual(order, [0, 1, 2, 3, 4]);
});


test('migrateState backfills stale localStorage so every unit has lessons, cards, quiz, and exam', () => {
  const stale = { ...initialState, flashcards: [], questions: [], subunits: initialState.subunits.filter((s) => s.unitId !== 'nb1_u2') };
  const migrated = migrateState(stale);
  assert.ok(migrated.subunits.some((s) => s.unitId === 'nb1_u2'));
  assert.ok(migrated.flashcards.some((f) => f.unitId === 'nb1_u2'));
  assert.ok(migrated.questions.some((q) => q.unitId === 'nb1_u2' && q.type !== 'exam'));
  assert.ok(migrated.questions.some((q) => q.unitId === 'nb1_u2' && q.type === 'exam'));
});
