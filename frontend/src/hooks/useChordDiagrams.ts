// Diagramas de violão: [string E, A, D, G, B, e] fret | 0=open | -1=muted
// Pestanas: [fret, fromStr, toStr]
interface GuitarShape { frets: number[]; barres?: [number, number, number][] }

const GUITAR: Record<string, GuitarShape> = {
  C:  { frets: [-1,3,2,0,1,0] },
  "C#":{ frets: [-1,4,3,1,2,1], barres: [[1,1,5]] },
  D:  { frets: [-1,-1,0,2,3,2] },
  "D#":{ frets: [-1,-1,1,3,4,3] },
  E:  { frets: [0,2,2,1,0,0] },
  F:  { frets: [1,3,3,2,1,1], barres: [[1,0,5]] },
  "F#":{ frets: [2,4,4,3,2,2], barres: [[2,0,5]] },
  G:  { frets: [3,2,0,0,0,3] },
  "G#":{ frets: [4,3,1,1,1,4], barres: [[1,1,4]] },
  A:  { frets: [-1,0,2,2,2,0] },
  "A#":{ frets: [-1,1,3,3,3,1], barres: [[1,1,5]] },
  B:  { frets: [-1,2,4,4,4,2], barres: [[2,1,5]] },
  Am: { frets: [-1,0,2,2,1,0] },
  Dm: { frets: [-1,-1,0,2,3,1] },
  Em: { frets: [0,2,2,0,0,0] },
  Bm: { frets: [-1,2,4,4,3,2], barres: [[2,1,5]] },
  Cm: { frets: [-1,3,5,5,4,3], barres: [[3,1,5]] },
  Fm: { frets: [1,3,3,1,1,1], barres: [[1,0,5]] },
  Gm: { frets: [3,5,5,3,3,3], barres: [[3,0,5]] },
  A7: { frets: [-1,0,2,0,2,0] },
  D7: { frets: [-1,-1,0,2,1,2] },
  E7: { frets: [0,2,2,1,3,0] },
  G7: { frets: [3,2,0,0,0,1] },
  C7: { frets: [-1,3,2,3,1,0] },
  Bb: { frets: [-1,1,3,3,3,1], barres: [[1,1,5]] },
};

// Notas do piano por acorde (semitons a partir de C = 0)
const PIANO: Record<string, number[]> = {
  C:[0,4,7], "C#":[1,5,8], D:[2,6,9], "D#":[3,7,10],
  E:[4,8,11], F:[5,9,0], "F#":[6,10,1], G:[7,11,2],
  "G#":[8,0,3], A:[9,1,4], "A#":[10,2,5], B:[11,3,6],
  Am:[9,0,4], Dm:[2,5,9], Em:[4,7,11], Bm:[11,2,6],
  Cm:[0,3,7], Fm:[5,8,0], Gm:[7,10,2],
  A7:[9,1,4,7], D7:[2,6,9,0], E7:[4,8,11,2], G7:[7,11,2,5], C7:[0,4,7,10],
  Bb:[10,2,5],
};

function resolveChord(chord: string) {
  if (GUITAR[chord]) return chord;
  // Tenta sem número (Am7 -> Am)
  const noNum = chord.replace(/[0-9]/g, "");
  if (GUITAR[noNum]) return noNum;
  // Tenta somente a base
  const base = chord.match(/^[A-G][#b]?/)?.[0] || "";
  if (GUITAR[base]) return base;
  return null;
}

// ────────────────── SVG GUITAR ──────────────────
export function buildGuitarSVG(chord: string, w = 70, h = 90): string {
  const key = resolveChord(chord);
  if (!key) return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#7a7060" font-size="10">?</text></svg>`;

  const data = GUITAR[key];
  const padL = 8, padT = 16, fretH = 11, strW = 9, numStr = 6, numFrets = 5;
  const W = padL + strW * (numStr - 1) + padL;
  const H = padT + fretH * numFrets + 10;

  const validFrets = data.frets.filter(f => f > 0);
  const minFret = validFrets.length ? Math.min(...validFrets) : 1;
  const startFret = minFret > 1 ? minFret : 1;

  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;

  // Pestana or nut
  if (startFret === 1) {
    svg += `<rect x="${padL}" y="${padT}" width="${strW*(numStr-1)}" height="2" fill="#c8973a"/>`;
  } else {
    svg += `<text x="${padL-5}" y="${padT+fretH*.7}" fill="#7a7060" font-size="7" font-family="monospace" text-anchor="end">${startFret}</text>`;
  }

  // Fret lines
  for (let i = 0; i <= numFrets-1; i++) {
    const y = padT + i * fretH;
    svg += `<line x1="${padL}" y1="${y}" x2="${padL+strW*(numStr-1)}" y2="${y}" stroke="#2a2a2a" stroke-width="0.5"/>`;
  }
  // Strings
  for (let s = 0; s < numStr; s++) {
    const x = padL + s * strW;
    svg += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT+fretH*(numFrets-1)}" stroke="#3a3a3a" stroke-width="0.8"/>`;
  }

  // Barres
  for (const [fret, from, to] of (data.barres || [])) {
    const fy = padT + (fret - startFret + 0.5) * fretH;
    svg += `<line x1="${padL+from*strW}" y1="${fy}" x2="${padL+to*strW}" y2="${fy}" stroke="#c8973a" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
  }

  // Dots
  data.frets.forEach((f, s) => {
    const cx = padL + s * strW;
    if (f === -1) {
      svg += `<text x="${cx}" y="${padT-4}" text-anchor="middle" fill="#4a4540" font-size="7">×</text>`;
    } else if (f === 0) {
      svg += `<circle cx="${cx}" cy="${padT-5}" r="3" fill="none" stroke="#6a6060" stroke-width="1"/>`;
    } else {
      const fy = padT + (f - startFret + 0.5) * fretH;
      svg += `<circle cx="${cx}" cy="${fy}" r="4" fill="#c8973a"/>`;
    }
  });

  svg += "</svg>";
  return svg;
}

// ────────────────── SVG PIANO ──────────────────
export function buildPianoSVG(chord: string, w = 90, h = 60): string {
  const key = resolveChord(chord) || chord.match(/^[A-G][#b]?/)?.[0] || "C";
  const notes = PIANO[key] || PIANO[key.replace(/[^A-G#b]/g, "")] || [0, 4, 7];
  const noteSet = new Set(notes.map(n => ((n % 12) + 12) % 12));

  const whites = [0,2,4,5,7,9,11];
  const bOffsets = [0.7,1.7,-1,3.7,4.7,5.7,-1];
  const blackNotes = [1,3,-1,6,8,10,-1];

  const wW = 11, wH = 48, bW = 7, bH = 30;
  const padX = 2, padY = 6;
  const totalW = padX*2 + wW*7;

  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${totalW} ${wH+padY+6}" xmlns="http://www.w3.org/2000/svg">`;

  whites.forEach((note, i) => {
    const x = padX + i * wW;
    const active = noteSet.has(note);
    svg += `<rect x="${x}" y="${padY}" width="${wW-1}" height="${wH}" rx="1" fill="${active ? "#c8973a" : "#e8e0d0"}" stroke="#161616" stroke-width="0.5"/>`;
  });

  bOffsets.forEach((offset, i) => {
    if (offset < 0) return;
    const note = blackNotes[i];
    if (note < 0) return;
    const x = padX + offset * wW + (wW - bW) / 2;
    const active = noteSet.has(note);
    svg += `<rect x="${x}" y="${padY}" width="${bW}" height="${bH}" rx="1" fill="${active ? "#7eb8a4" : "#1a1a1a"}" stroke="#0d0d0d" stroke-width="0.5"/>`;
  });

  svg += "</svg>";
  return svg;
}
