import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { songService } from "../services";
import { useAuthStore } from "../context/authStore";
import SongModal from "../components/SongModal";
import { toast } from "../components/Toast";
import type { Song } from "../types";
import styles from "./SongsPage.module.css";

const GENRES = ["","Gospel","Sertanejo","MPB","Rock","Pop","Forró","Pagode","Hino","Outro"];

export default function SongsPage() {
  const { can } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["songs", search, genre, page],
    queryFn: () => songService.list({ search: search || undefined, genre: genre || undefined, page, pageSize: 20 }),
    placeholderData: (prev) => prev,
  });

  const deleteMut = useMutation({
    mutationFn: songService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["songs"] }); toast("Cifra excluída"); },
    onError: (e: any) => toast(e.response?.data?.error || "Erro ao excluir", "error"),
  });

  function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!confirm("Excluir esta cifra?")) return;
    deleteMut.mutate(id);
  }

  function handleEdit(e: React.MouseEvent, song: Song) {
    e.stopPropagation();
    setEditingSong(song);
    setModalOpen(true);
  }

  function openNew() {
    setEditingSong(null);
    setModalOpen(true);
  }

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.subLabel}>Repertório</p>
          <h1 className={styles.title}>Cifras</h1>
        </div>
        {can(["ADMIN", "EDITOR"]) && (
          <button className="btn btn-primary" onClick={openNew}>+ Nova Cifra</button>
        )}
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Buscar por título ou artista..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="input select"
          style={{ minWidth: 160 }}
          value={genre}
          onChange={(e) => { setGenre(e.target.value); setPage(1); }}
        >
          {GENRES.map((g) => <option key={g} value={g}>{g || "Todos os gêneros"}</option>)}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className={styles.grid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 3 }} />
          ))}
        </div>
      ) : !data?.songs.length ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>♪</div>
          <p>Nenhuma cifra encontrada</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {data.songs.map((song) => (
              <div key={song.id} className={styles.card} onClick={() => navigate(`/songs/${song.id}`)}>
                <div className={styles.cardActions}>
                  {can(["ADMIN", "EDITOR"]) && (
                    <button className="btn-icon" title="Editar" onClick={(e) => handleEdit(e, song)}>✎</button>
                  )}
                  {can(["ADMIN"]) && (
                    <button className="btn-icon danger" title="Excluir" onClick={(e) => handleDelete(e, song.id)}>✕</button>
                  )}
                </div>
                <div className={styles.cardTitle}>{song.title}</div>
                <div className={styles.cardArtist}>{song.artist}</div>
                <div className={styles.cardMeta}>
                  <span className="tag tag-key">Tom: {song.key}</span>
                  <span className="tag tag-genre">{song.genre}</span>
                  {song.capo > 0 && <span className="tag tag-capo">Capo {song.capo}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {data.totalPages > 1 && (
            <div className={styles.pagination}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
              <span className={styles.pageInfo}>{page} / {data.totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <SongModal song={editingSong} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
