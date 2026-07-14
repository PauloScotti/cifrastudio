import { useState, useCallback } from "react";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
};

function normalizeNote(note: string): string {
  return FLAT_TO_SHARP[note] || note;
}

function transposeNote(note: string, semitones: number): string {
  const n = normalizeNote(note);
  const idx = NOTES.indexOf(n);
  if (idx === -1) return note;
  return NOTES[((idx + semitones) % 12 + 12) % 12];
}

// Transpõe um token de acorde completo (ex: "Am7", "G/B", "Csus4")
export function transposeChordToken(chord: string, semitones: number): string {
  if (semitones === 0) return chord;
  // Regex: captura a nota base (A-G + # ou b), sufixo opcional, baixo opcional
  return chord.replace(/^([A-G][#b]?)(.*)$/, (_, root, suffix) => {
    // Trata baixo alternativo: G/B -> transpõe G e B separadamente
    if (suffix.startsWith("/")) {
      const bass = suffix.slice(1);
      const bassParts = bass.match(/^([A-G][#b]?)(.*)$/);
      if (bassParts) {
        return transposeNote(root, semitones) + "/" + transposeNote(bassParts[1], semitones) + bassParts[2];
      }
    }
    return transposeNote(root, semitones) + suffix;
  });
}

export function transposeKey(key: string, semitones: number): string {
  return transposeNote(normalizeNote(key), ((semitones % 12) + 12) % 12);
}

// Detecta se uma linha é predominantemente acordes
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  const chordRegex = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M)?[0-9]?(?:\/[A-G][#b]?)?$/;
  const chordCount = tokens.filter((t) => chordRegex.test(t) || t === "|" || t === "-").length;
  return chordCount / tokens.length >= 0.6;
}

// Transpõe todos os acordes em uma linha de acordes
export function transposeChordLine(line: string, semitones: number): string {
  return line.replace(/[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M)?[0-9]?(?:\/[A-G][#b]?)?/g, (match) =>
    transposeChordToken(match, semitones)
  );
}

// Extrai acordes únicos de uma cifra completa
export function extractChords(cifra: string): string[] {
  const chordRegex = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M)?[0-9]?)\b/g;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = chordRegex.exec(cifra)) !== null) {
    found.add(m[1]);
  }
  return [...found];
}

// ──────────────────────────────────────────
// Hook principal
// ──────────────────────────────────────────
export function useTranspose(originalKey: string, originalCapo: number) {
  const [semitones, setSemitones] = useState(0);
  const [capo, setCapo] = useState(originalCapo);

  const up = useCallback(() => setSemitones((s) => (s + 1) % 12), []);
  const down = useCallback(() => setSemitones((s) => ((s - 1) + 12) % 12), []);
  const capoUp = useCallback(() => setCapo((c) => Math.min(12, c + 1)), []);
  const capoDown = useCallback(() => setCapo((c) => Math.max(0, c - 1)), []);
  const reset = useCallback(() => { setSemitones(0); setCapo(originalCapo); }, [originalCapo]);

  const currentKey = transposeKey(originalKey, semitones);

  const transposeLine = useCallback(
    (line: string) => isChordLine(line) ? transposeChordLine(line, semitones) : line,
    [semitones]
  );

  const transposeAll = useCallback(
    (cifra: string) => cifra.split("\n").map(transposeLine).join("\n"),
    [transposeLine]
  );

  return { semitones, capo, currentKey, up, down, capoUp, capoDown, reset, transposeLine, transposeAll };
}
