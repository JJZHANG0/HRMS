import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "/api/";

export const http = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getBackendFileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = process.env.REACT_APP_BACKEND_BASE || "";
  return `${base}${path}`;
};
