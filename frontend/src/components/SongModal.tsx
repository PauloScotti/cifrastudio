import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { songService } from "../services";
import { toast } from "./Toast";
import type { Song } from "../types";

const KEYS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const GENRES = ["Gospel","Sertanejo","MPB","Rock","Pop","Forró","Pagode","Hino","Outro"];

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  artist: z.string().min(1, "Artista obrigatório"),
  key: z.string().min(1),
  genre: z.string().min(1),
  capo: z.number().int().min(0).max(12),
  cifra: z.string().min(1, "Cifra obrigatória"),
  tab: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  song?: Song | null;
  onClose: () => void;
}

export default function SongModal({ song, onClose }: Props) {
  const qc = useQueryClient();
  const isEdit = !!song;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { key: "G", genre: "Gospel", capo: 0 },
  });

  useEffect(() => {
    if (song) {
      reset({
        title: song.title, artist: song.artist, key: song.key,
        genre: song.genre, capo: song.capo,
        cifra: song.cifra, tab: song.tab || "",
      });
    } else {
      reset({ title: "", artist: "", key: "G", genre: "Gospel", capo: 0, cifra: "", tab: "" });
    }
  }, [song, reset]);

  const createMut = useMutation({
    mutationFn: songService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["songs"] }); toast("Cifra criada!"); onClose(); },
    onError: (e: any) => toast(e.response?.data?.error || "Erro ao criar", "error"),
  });

  const updateMut = useMutation({
    mutationFn: (data: FormData) => songService.update(song!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["songs"] }); toast("Cifra atualizada!"); onClose(); },
    onError: (e: any) => toast(e.response?.data?.error || "Erro ao atualizar", "error"),
  });

  const loading = createMut.isPending || updateMut.isPending;

  function onSubmit(data: FormData) {
    if (isEdit) updateMut.mutate(data);
    else createMut.mutate(data);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <h2 className="modal-title">{isEdit ? "Editar Cifra" : "Nova Cifra"}</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Título</label>
              <input className="input" {...register("title")} placeholder="Nome da música" />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Artista</label>
              <input className="input" {...register("artist")} placeholder="Artista ou banda" />
              {errors.artist && <p className="form-error">{errors.artist.message}</p>}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Tom Original</label>
              <select className="input select" {...register("key")}>
                {KEYS.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gênero</label>
              <select className="input select" {...register("genre")}>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ maxWidth: 120 }}>
            <label className="form-label">Capotraste</label>
            <input className="input" type="number" min={0} max={12} {...register("capo")} />
          </div>

          <div className="form-group">
            <label className="form-label">Cifra</label>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "monospace" }}>
              Use [INTRO], [VERSO], [CORO], [PONTE] como marcadores de seção
            </p>
            <textarea
              className="input textarea input-mono"
              style={{ height: 220 }}
              {...register("cifra")}
              placeholder={`[INTRO]\nG  D  Em  C\n\n[VERSO]\nG              D\nPrimeira linha da letra`}
            />
            {errors.cifra && <p className="form-error">{errors.cifra.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Tablatura (opcional)</label>
            <textarea
              className="input textarea input-mono"
              style={{ height: 110 }}
              {...register("tab")}
              placeholder={`e|---0---2---3---2---|\nB|---1---3---0---1---|\nG|---0---2---0---0---|`}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : isEdit ? "Salvar Alterações" : "Criar Cifra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
