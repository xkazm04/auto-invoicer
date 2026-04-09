const STORAGE_KEY = "invoice-last-number";

export function getNextInvoiceNumber(): string {
  const year = new Date().getFullYear();
  let lastSeq = 0;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.year === year) {
        lastSeq = parsed.seq;
      }
    }
  } catch {
    // fresh start
  }

  const nextSeq = lastSeq + 1;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ year, seq: nextSeq }));
  } catch {
    // quota exceeded — still return a number
  }

  return `${year}-${String(nextSeq).padStart(4, "0")}`;
}
