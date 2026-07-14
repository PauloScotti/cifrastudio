import { api } from "./api";
import type { AuthResponse, User, Song, SongListResponse, SongFormData } from "../types";

// ── AUTH ──────────────────────────────────────────
export const authService = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { username, password }).then((r) => r.data),

  register: (name: string, username: string, password: string, role: "VIEWER" | "EDITOR") =>
    api.post<AuthResponse>("/auth/register", { name, username, password, role }).then((r) => r.data),

  me: () =>
    api.get<{ user: User }>("/auth/me").then((r) => r.data.user),
};

// ── SONGS ─────────────────────────────────────────
export const songService = {
  list: (params?: { search?: string; genre?: string; page?: number; pageSize?: number }) =>
    api.get<SongListResponse>("/songs", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<{ song: Song }>(`/songs/${id}`).then((r) => r.data.song),

  create: (data: SongFormData) =>
    api.post<{ song: Song }>("/songs", data).then((r) => r.data.song),

  update: (id: number, data: Partial<SongFormData>) =>
    api.put<{ song: Song }>(`/songs/${id}`, data).then((r) => r.data.song),

  delete: (id: number) =>
    api.delete(`/songs/${id}`),

  genres: () =>
    api.get<{ genres: string[] }>("/songs/genres").then((r) => r.data.genres),
};

// ── USERS (admin) ─────────────────────────────────
export const userService = {
  list: () =>
    api.get<{ users: User[] }>("/users").then((r) => r.data.users),

  create: (data: { name: string; username: string; password: string; role: string }) =>
    api.post<{ user: User }>("/users", data).then((r) => r.data.user),

  updateRole: (id: number, role: string) =>
    api.put<{ user: User }>(`/users/${id}/role`, { role }).then((r) => r.data.user),

  delete: (id: number) =>
    api.delete(`/users/${id}`),
};
