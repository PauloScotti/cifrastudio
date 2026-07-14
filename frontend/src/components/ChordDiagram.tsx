import { buildGuitarSVG, buildPianoSVG } from "../hooks/useChordDiagrams";
import styles from "./ChordDiagram.module.css";

interface Props {
  chord: string;
  mode: "guitar" | "piano";
  onClick?: (chord: string) => void;
  size?: "sm" | "md";
}

export function ChordDiagram({ chord, mode, onClick, size = "sm" }: Props) {
  const svg = mode === "guitar"
    ? buildGuitarSVG(chord, size === "sm" ? 70 : 100, size === "sm" ? 88 : 120)
    : buildPianoSVG(chord, size === "sm" ? 88 : 120, size === "sm" ? 58 : 78);

  return (
    <div
      className={`${styles.diagram} ${onClick ? styles.clickable : ""}`}
      onClick={() => onClick?.(chord)}
      title={`Acorde ${chord} — clique para ampliar`}
    >
      <div className={styles.name}>{chord}</div>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

// Modal ampliado com os dois instrumentos
interface DetailProps { chord: string; onClose: () => void; }

export function ChordDetailModal({ chord, onClose }: DetailProps) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <h2 className="modal-title" style={{ fontFamily: "'Playfair Display',serif", marginBottom: 24 }}>
          Acorde: {chord}
        </h2>
        <div className={styles.detailGrid}>
          <div>
            <p className={styles.instrLabel} style={{ color: "var(--accent)" }}>🎸 Violão</p>
            <div dangerouslySetInnerHTML={{ __html: buildGuitarSVG(chord, 110, 138) }} />
          </div>
          <div>
            <p className={styles.instrLabel} style={{ color: "var(--accent2)" }}>🎹 Teclado</p>
            <div dangerouslySetInnerHTML={{ __html: buildPianoSVG(chord, 130, 88) }} />
          </div>
        </div>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
