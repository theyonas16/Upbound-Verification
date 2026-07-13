'use client';

// Tesseract.js OCR over the ID document. Extracts raw text and a best-effort
// name guess. SSN is intentionally NOT parsed — per underwriting, SSN is never
// on the ID and is always entered by hand.

export interface OcrResult {
  text: string;
  name: string | null;
  confidence: number;
}

export async function readIdDocument(
  imageDataUrl: string,
  onProgress?: (p: number) => void
): Promise<OcrResult> {
  const Tesseract = (await import('tesseract.js')).default;
  const { data } = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: (m: { status: string; progress: number }) => {
      if (onProgress && m.status === 'recognizing text') onProgress(m.progress);
    },
  });
  const text = data.text || '';
  return { text, name: guessName(text), confidence: data.confidence };
}

function guessName(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const candidate = lines.find(
    (l) => /^[A-Z][A-Z ,.'-]{4,40}$/.test(l) && l.split(' ').length >= 2
  );
  return candidate ? titleCase(candidate.replace(/,/g, ' ').replace(/\s+/g, ' ')) : null;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
    .trim();
}
