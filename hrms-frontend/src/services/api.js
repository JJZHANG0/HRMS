// src/services/api.js
import { http } from "./http";

const ACCOUNT_PREFIX = "accounts/";

export const registerUser = (userData) => http.post(`${ACCOUNT_PREFIX}register/`, userData);

export const loginUser = (userData) => http.post(`${ACCOUNT_PREFIX}login/`, userData);
