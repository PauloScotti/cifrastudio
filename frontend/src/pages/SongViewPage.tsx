import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { songService } from "../services";
import { useTranspose, isChordLine, extractChords, transposeChordLine } from "../hooks/useTranspose";
import { ChordDiagram, ChordDetailModal } from "../components/ChordDiagram";
import styles from "./SongViewPage.module.css";

export default function SongViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagMode, setDiagMode] = useState<"guitar" | "piano">("guitar");
  const [showTab, setShowTab] = useState(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  const { data: song, isLoading, error } = useQuery({
    queryKey: ["song", id],
    queryFn: () => songService.get(Number(id)),
    enabled: !!id,
  });

  const { semitones, capo, currentKey, up, down, capoUp, capoDown, reset } = useTranspose(
    song?.key || "C",
    song?.capo || 0
  );

  if (isLoading) return (
    <div className={styles.loadingWrap}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
  if (error || !song) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: "var(--text-muted)" }}>Cifra não encontrada.</p>
      <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate("/")}>← Voltar</button>
    </div>
  );

  const chords = extractChords(song.cifra).map(c => {
    const base = c.match(/^[A-G][#b]?/)?.[0] || c;
    return transposeChordLine(base, semitones);
  });
  const uniqueChords = [...new Set(chords)];

  return (
    <div>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")} style={{ marginBottom: 20 }}>
        ← Voltar
      </button>

      {/* Song header + controls */}
      <div className={styles.viewHeader}>
        <div className={styles.songInfo}>
          <h1 className={styles.songTitle}>{song.title}</h1>
          <p className={styles.songArtist}>{song.artist}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span className="tag tag-genre">{song.genre}</span>
            {song.authorName && (
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>por {song.authorName}</span>
            )}
          </div>
        </div>

        <div className={styles.controls}>
          {/* Tom */}
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Tom</span>
            <button className={styles.ctrlBtn} onClick={down}>−</button>
            <span className={styles.ctrlVal}>{currentKey}</span>
            <button className={styles.ctrlBtn} onClick={up}>+</button>
          </div>

          {/* Capo */}
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Capo</span>
            <button className={styles.ctrlBtn} onClick={capoDown}>−</button>
            <span className={styles.ctrlVal}>{capo}</span>
            <button className={styles.ctrlBtn} onClick={capoUp}>+</button>
          </div>

          {semitones !== 0 && (
            <button className="btn btn-ghost btn-sm" onClick={reset} title="Resetar tom e capo">↺ Reset</button>
          )}
          {song.tab && (
            <button className={`btn btn-sm ${showTab ? "btn-secondary" : "btn-ghost"}`} onClick={() => setShowTab(v => !v)}>
              ♩ Tab
            </button>
          )}
        </div>
      </div>

      {/* Layout: cifra + sidebar */}
      <div className={styles.layout}>
        {/* Cifra */}
        <div className={styles.cifraWrap}>
          <div className={styles.cifraBody}>
            {song.cifra.split("\n").map((line, i) => {
              const isSection = /^\[.*\]$/.test(line.trim());
              if (isSection) {
                return <span key={i} className={styles.sectionLabel}>{line.trim().slice(1,-1)}</span>;
              }
              const transposed = isChordLine(line) ? transposeChordLine(line, semitones) : line;
              return (
                <span key={i} className={isChordLine(line) ? styles.chordLine : styles.lyricLine}>
                  {transposed || "\u00A0"}
                </span>
              );
            })}
          </div>

          {/* Tablatura */}
          {showTab && song.tab && (
            <div className={styles.tabSection}>
              <p className={styles.tabTitle}>🎸 Tablatura</p>
              <pre className={styles.tabBody}>{song.tab}</pre>
            </div>
          )}
        </div>

        {/* Sidebar: diagramas */}
        <div className={styles.sidebar}>
          <div className={styles.chordPanel}>
            <div className={styles.chordPanelHeader}>
              <span className={styles.controlLabel}>Acordes</span>
              <div className={styles.modeTabs}>
                <button
                  className={`${styles.modeTab} ${diagMode === "guitar" ? styles.modeTabActive : ""}`}
                  onClick={() => setDiagMode("guitar")}
                >🎸</button>
                <button
                  className={`${styles.modeTab} ${diagMode === "piano" ? styles.modeTabActive : ""}`}
                  onClick={() => setDiagMode("piano")}
                >🎹</button>
              </div>
            </div>

            {uniqueChords.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>
                Nenhum acorde detectado
              </p>
            ) : (
              <div className={styles.diagramGrid}>
                {uniqueChords.slice(0, 12).map((chord) => (
                  <ChordDiagram key={chord} chord={chord} mode={diagMode} onClick={setSelectedChord} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chord detail modal */}
      {selectedChord && (
        <ChordDetailModal chord={selectedChord} onClose={() => setSelectedChord(null)} />
      )}
    </div>
  );
}
