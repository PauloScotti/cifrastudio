import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userService } from "../services";
import { useAuthStore } from "../context/authStore";
import { toast } from "../components/Toast";
import type { User } from "../types";
import styles from "./AdminPage.module.css";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  username: z.string().min(3).regex(/^[a-z0-9_.]+$/, "Use letras minúsculas, números, ponto ou underline"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});
type FormData = z.infer<typeof schema>;


export default function AdminPage() {
  const qc = useQueryClient();
  const { user: me } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.list,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "VIEWER" },
  });

  const createMut = useMutation({
    mutationFn: userService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast("Usuário criado!"); setModalOpen(false); reset(); },
    onError: (e: any) => toast(e.response?.data?.error || "Erro ao criar usuário", "error"),
  });

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => userService.updateRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast("Papel atualizado"); },
    onError: (e: any) => toast(e.response?.data?.error || "Erro", "error"),
  });

  const deleteMut = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast("Usuário removido"); },
    onError: (e: any) => toast(e.response?.data?.error || "Erro ao remover", "error"),
  });

  function handleDelete(user: User) {
    if (!confirm(`Remover @${user.username}?`)) return;
    deleteMut.mutate(user.id);
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <p className={styles.subLabel}>Administração</p>
          <h1 className={styles.title}>Usuários</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Novo Usuário</button>
      </div>

      {isLoading ? (
        <div className={styles.table}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 54 }} />)}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Usuário</th>
                <th>Nível de acesso</th>
                <th>Membro desde</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id} className={user.id === me?.id ? styles.meRow : ""}>
                  <td>{user.name}{user.id === me?.id && <span className={styles.youBadge}>você</span>}</td>
                  <td className={styles.mono}>@{user.username}</td>
                  <td>
                    <select
                      className={styles.roleSelect}
                      value={user.role}
                      onChange={(e) => roleMut.mutate({ id: user.id, role: e.target.value })}
                      disabled={user.id === me?.id}
                    >
                      <option value="VIEWER">Visualizador</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </td>
                  <td className={styles.mono} style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    {user.id !== me?.id && (
                      <button className="btn-icon danger" onClick={() => handleDelete(user)} title="Remover">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create user modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <h2 className="modal-title">Novo Usuário</h2>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} noValidate>
              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input className="input" {...register("name")} placeholder="Nome completo" />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Usuário</label>
                  <input className="input" {...register("username")} placeholder="nome.usuario" />
                  {errors.username && <p className="form-error">{errors.username.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Senha</label>
                  <input className="input" type="password" {...register("password")} placeholder="mínimo 4 chars" />
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nível de acesso</label>
                <select className="input select" {...register("role")}>
                  <option value="VIEWER">Visualizador</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending}>
                  {createMut.isPending ? <span className="spinner" /> : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
