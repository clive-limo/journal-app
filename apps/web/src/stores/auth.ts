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
  defaultJournal?: {
    id: string;
    title: string;
    _count: {
      entries: number;
    };
  } | null;
};

const API_BASE = import.meta.env.VITE_BASE_URL as string;

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(localStorage.getItem("token") || "");
  const user = ref<User | null>(null);
  const returnTo = ref<string>("/home");
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  if (token.value) {
    api.defaults.headers.common.Authorization = `Bearer ${token.value}`;
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const defaultJournal = computed(() => user.value?.defaultJournal);

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem("token", t);
    api.defaults.headers.common.Authorization = `Bearer ${t}`;
  }

  function clearAuth() {
    token.value = "";
    user.value = null;
    error.value = null;
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
  }

  async function fetchMe() {
    if (!token.value) {
      console.log("No token available for fetchMe");
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.get("/auth/me");
      user.value = data;
      console.log("User fetched successfully:", data);
      console.log("Default journal:", data.defaultJournal);
    } catch (err: any) {
      console.error("Failed to fetch user:", err);
      error.value =
        err.response?.data?.message || "Failed to fetch user profile";

      if (err.response?.status === 401) {
        clearAuth();
      }
      throw err;
    } finally {
      isLoading.value = false;
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
        console.warn("State mismatch - continuing anyway");
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
    } catch (error: any) {
      console.error("Callback error:", error);
      clearAuth();
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

  if (token.value) {
    fetchMe().catch(() => {
      clearAuth();
    });
  }

  return {
    token,
    user,
    returnTo,
    isAuthenticated,
    isLoading,
    error,
    defaultJournal,
    setToken,
    clearAuth,
    fetchMe,
    loginWithGoogle,
    handleCallback,
    signout,
  };
});
