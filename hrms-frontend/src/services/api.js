// src/services/api.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/accounts/";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// 注册
export const registerUser = (userData) => api.post("register/", userData);

// 登录
export const loginUser = (userData) => api.post("login/", userData);
