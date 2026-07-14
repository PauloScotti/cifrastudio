export type Role = "ADMIN" | "EDITOR" | "VIEWER";

export interface User {
  id: number;
  name: string;
  username: string;
  role: Role;
  createdAt: string;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  key: string;
  genre: string;
  capo: number;
  cifra: string;
  tab?: string | null;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorUsername?: string;
}

export interface SongListResponse {
  songs: Song[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type SongFormData = {
  title: string;
  artist: string;
  key: string;
  genre: string;
  capo: number;
  cifra: string;
  tab?: string;
};
