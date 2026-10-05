import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GARAGE_PRESETS,
  buildLeadFields,
  calculateEstimateCents,
  formatCurrency,
  parseSquareFootage,
} from '../docs/calculator.mjs';

test('garage presets match the approved size guide', () => {
  assert.deepEqual(GARAGE_PRESETS, { one: 250, two: 500, three: 750 });
});

test('parses a positive whole square-footage value', () => {
  assert.deepEqual(parseSquareFootage(' 425 '), { ok: true, value: 425 });
});

test('rejects blank, zero, decimal, and non-numeric square footage', () => {
  for (const value of ['', '0', '250.5', 'abc']) {
    assert.equal(parseSquareFootage(value).ok, false, value);
  }
});

test('calculates estimate cents at the approved $4.75 per square foot', () => {
  assert.equal(calculateEstimateCents(1), 475);
  assert.equal(calculateEstimateCents(250), 118750);
  assert.equal(calculateEstimateCents(425), 201875);
  assert.equal(calculateEstimateCents(500), 237500);
  assert.equal(calculateEstimateCents(750), 356250);
  assert.equal(formatCurrency(201875), '$2,018.75');
});

test('rejects invalid estimate inputs', () => {
  assert.throws(() => calculateEstimateCents(0), /positive whole number/);
  assert.throws(() => calculateEstimateCents(12.5), /positive whole number/);
});

test('creates the exact Formspree lead fields', () => {
  assert.deepEqual(
    buildLeadFields({ squareFeet: 500, sizeSelection: 'two-car', finish: 'Orbit', submittedFrom: 'https://quote.example.com' }),
    {
      square_footage: '500',
      size_selection: 'two-car',
      finish: 'Orbit',
      estimate_total: '$2,375.00',
      submitted_from: 'https://quote.example.com',
    },
  );
});
