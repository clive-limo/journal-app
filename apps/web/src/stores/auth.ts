import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/axios";

type User = {
  id: string; 
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profileImage?: string;
  authProvider?: string;
};

const API_BASE = import.meta.env.VITE_BASE_URL as string;

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(localStorage.getItem("token") || "");
  const user = ref<User | null>(null);
  const returnTo = ref<string>("/home"); 

  if (token.value) {
    api.defaults.headers.common.Authorization = `Bearer ${token.value}`;
  }

  const isAuthenticated = computed(() => !!token.value);

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem("token", t);
    api.defaults.headers.common.Authorization = `Bearer ${t}`;
  }

  function clearAuth() {
    token.value = "";
    user.value = null;
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      const { data } = await api.get("/auth/me");
      user.value = data;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      if (error.response?.status === 401) {
        clearAuth();
      }
    }
  }

  function loginWithGoogle() {
    const url = `${API_BASE}/auth/google`;
    const state = btoa(
      JSON.stringify({ t: Date.now(), returnTo: returnTo.value })
    );
    sessionStorage.setItem("oauth_state", state);
    window.location.href = `${url}?state=${encodeURIComponent(state)}`;
  }

  async function handleCallback(t: string, state?: string) {
    try {
      const saved = sessionStorage.getItem("oauth_state");
      if (state && saved && state !== saved) {
        throw new Error("Invalid state parameter");
      }

      setToken(t);
      await fetchMe();

      if (state) {
        try {
          const decoded = JSON.parse(atob(state));
          if (decoded.returnTo) {
            returnTo.value = decoded.returnTo;
          }
        } catch (e) {
          console.error("Failed to parse state:", e);
        }
      }

      sessionStorage.removeItem("oauth_state");
    } catch (error) {
      console.error("Callback error:", error);
      throw error;
    }
  }

  async function signout() {
    try {
      if (token.value) {
        await api.post("/auth/signout");
      }
    } catch (error) {
      console.error("Signout error:", error);
    } finally {
      clearAuth();
    }
  }

  return {
    token,
    user,
    returnTo,
    isAuthenticated,
    setToken,
    clearAuth,
    fetchMe,
    loginWithGoogle,
    handleCallback,
    signout,
  };
});
