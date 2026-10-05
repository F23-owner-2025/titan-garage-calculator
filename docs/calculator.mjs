export const GARAGE_PRESETS = Object.freeze({ one: 250, two: 500, three: 750 });

const RATE_CENTS_PER_SQUARE_FOOT = 475;

export function parseSquareFootage(raw) {
  const value = String(raw ?? '').trim();
  if (!/^[1-9]\d*$/.test(value)) {
    return { ok: false, error: 'Enter a whole number greater than zero.' };
  }

  const squareFeet = Number(value);
  if (!Number.isSafeInteger(squareFeet)) {
    return { ok: false, error: 'Enter a valid square-footage value.' };
  }

  return { ok: true, value: squareFeet };
}

export function calculateEstimateCents(squareFeet) {
  if (!Number.isSafeInteger(squareFeet) || squareFeet < 1) {
    throw new TypeError('squareFeet must be a positive whole number');
  }
  return squareFeet * RATE_CENTS_PER_SQUARE_FOOT;
}

export function formatCurrency(cents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function buildLeadFields({ squareFeet, sizeSelection, finish, submittedFrom }) {
  return {
    square_footage: String(squareFeet),
    size_selection: sizeSelection,
    finish,
    estimate_total: formatCurrency(calculateEstimateCents(squareFeet)),
    submitted_from: submittedFrom,
  };
}
