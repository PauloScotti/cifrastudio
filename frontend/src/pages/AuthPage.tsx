import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../services";
import { useAuthStore } from "../context/authStore";
import { toast } from "../components/Toast";
import styles from "./AuthPage.module.css";

// ── Schemas ──────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
});
const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  username: z.string().min(3, "Mínimo 3 caracteres").regex(/^[a-z0-9_.]+$/, "Use letras minúsculas, números, ponto ou underline"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
  role: z.enum(["VIEWER", "EDITOR"]),
});
type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

// ── Componente ────────────────────────────────────
export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "VIEWER" },
  });

  async function handleLogin(data: LoginData) {
    setLoading(true);
    try {
      const res = await authService.login(data.username, data.password);
      setAuth(res.token, res.user);
      navigate("/");
    } catch (err: any) {
      toast(err.response?.data?.error || "Erro ao fazer login", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(data: RegisterData) {
    setLoading(true);
    try {
      const res = await authService.register(data.name, data.username, data.password, data.role);
      setAuth(res.token, res.user);
      toast("Conta criada com sucesso!");
      navigate("/");
    } catch (err: any) {
      toast(err.response?.data?.error || "Erro ao registrar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.accent} />
        <div className={styles.logo}>CifraStudio</div>
        <div className={styles.sub}>Sistema de Gestão de Cifras Musicais</div>

        {mode === "login" ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} noValidate>
            <div className="form-group">
              <label className="form-label">Usuário</label>
              <input className="input" {...loginForm.register("username")} placeholder="seu usuário" autoComplete="username" />
              {loginForm.formState.errors.username && (
                <p className="form-error">{loginForm.formState.errors.username.message}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="input" type="password" {...loginForm.register("password")} placeholder="••••••••" autoComplete="current-password" />
              {loginForm.formState.errors.password && (
                <p className="form-error">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
              {loading ? <span className="spinner" /> : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} noValidate>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input className="input" {...registerForm.register("name")} placeholder="Seu nome" />
              {registerForm.formState.errors.name && (
                <p className="form-error">{registerForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Usuário</label>
                <input className="input" {...registerForm.register("username")} placeholder="nome.usuario" autoComplete="username" />
                {registerForm.formState.errors.username && (
                  <p className="form-error">{registerForm.formState.errors.username.message}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="input" type="password" {...registerForm.register("password")} placeholder="mínimo 4 chars" autoComplete="new-password" />
                {registerForm.formState.errors.password && (
                  <p className="form-error">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nível de acesso</label>
              <select className="input select" {...registerForm.register("role")}>
                <option value="VIEWER">Visualizador — somente leitura</option>
                <option value="EDITOR">Editor — cadastrar e editar</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
              {loading ? <span className="spinner" /> : "Criar Conta"}
            </button>
          </form>
        )}

        <div className={styles.switch}>
          {mode === "login" ? (
            <>Não tem conta?{" "}<button className={styles.switchBtn} onClick={() => setMode("register")}>Registrar</button></>
          ) : (
            <>Já tem conta?{" "}<button className={styles.switchBtn} onClick={() => setMode("login")}>Entrar</button></>
          )}
        </div>

        <div className={styles.hints}>
          <span>admin / admin123</span>
          <span>editor / editor123</span>
          <span>visitante / visitante123</span>
        </div>
      </div>
    </div>
  );
}
