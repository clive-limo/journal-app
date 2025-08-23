import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/axios";
import type {
  MoodPoint,
  MoodRangeResponse,
  WeeklyProfileResponse,
  UpsertMood,
  QueryRange,
} from "@/types/mood";

export const useMoodPointsStore = defineStore("moodPoints", () => {
  const moodPoints = ref<MoodPoint[]>([]);
  const weeklyProfile = ref<WeeklyProfileResponse | null>(null);
  const currentRange = ref<{ from: string; to: string } | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const todaysMood = ref<MoodPoint | null>(null);

  const hasMoodPoints = computed(() => moodPoints.value.length > 0);

  const averageMood = computed(() => {
    if (moodPoints.value.length === 0) return 0;
    const sum = moodPoints.value.reduce((acc, point) => acc + point.score, 0);
    return Math.round((sum / moodPoints.value.length) * 10) / 10;
  });

  const moodTrend = computed(() => {
    if (moodPoints.value.length < 2) return "stable";
    const recent = moodPoints.value.slice(-7);
    if (recent.length < 2) return "stable";

    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));

    const firstAvg =
      firstHalf.reduce((acc, p) => acc + p.score, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((acc, p) => acc + p.score, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.5) return "improving";
    if (secondAvg < firstAvg - 0.5) return "declining";
    return "stable";
  });

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getToday = (): string => formatDate(new Date());


  async function upsertMood(d: UpsertMood) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<MoodPoint>("/mood-points", d);

      const dayToUpdate = d.day || getToday();
      const existingIndex = moodPoints.value.findIndex(
        (p) => p.day === dayToUpdate
      );

      if (existingIndex >= 0) {
        moodPoints.value[existingIndex] = data;
      } else {
        moodPoints.value.push(data);
        moodPoints.value.sort((a, b) => a.day.localeCompare(b.day));
      }

      if (dayToUpdate === getToday()) {
        todaysMood.value = data;
      }

      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to save mood";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMoodRange(query?: QueryRange) {
    isLoading.value = true;
    error.value = null;

    try {
      // Default to last 7 days if no range specified
      const params = query || {
        from: formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
        to: getToday(),
      };

      const { data } = await api.get<MoodRangeResponse>("/mood-points", {
        params,
      });

      moodPoints.value = data.points;
      currentRange.value = { from: data.from, to: data.to };

      const today = getToday();
      todaysMood.value = data.points.find((p) => p.day === today) || null;

      return data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Failed to fetch mood points";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchWeeklyProfile() {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<WeeklyProfileResponse>(
        "/mood-points/weekly-profile"
      );
      weeklyProfile.value = data;
      return data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Failed to fetch weekly profile";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function recomputeDay(day: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<MoodPoint | null>(
        "/mood-points/recompute-day",
        { day }
      );

      if (data) {
        const existingIndex = moodPoints.value.findIndex((p) => p.day === day);
        if (existingIndex >= 0) {
          moodPoints.value[existingIndex] = data;
        } else {
          moodPoints.value.push(data);
          moodPoints.value.sort((a, b) => a.day.localeCompare(b.day));
        }
      } else {
        moodPoints.value = moodPoints.value.filter((p) => p.day !== day);
      }

      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to recompute mood";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteMoodPoint(day: string) {
    isLoading.value = true;
    error.value = null;

    try {
      await api.delete("/mood-points", { params: { day } });

      moodPoints.value = moodPoints.value.filter((p) => p.day !== day);

      if (day === getToday()) {
        todaysMood.value = null;
      }

      return true;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || "Failed to delete mood point";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function initialize() {
    await fetchMoodRange();
    await fetchWeeklyProfile();
  }

  function clearMoodData() {
    moodPoints.value = [];
    weeklyProfile.value = null;
    currentRange.value = null;
    todaysMood.value = null;
    error.value = null;
  }

  return {
    moodPoints,
    weeklyProfile,
    currentRange,
    isLoading,
    error,
    todaysMood,

    // Getters
    hasMoodPoints,
    averageMood,
    moodTrend,

    // Actions
    upsertMood,
    fetchMoodRange,
    fetchWeeklyProfile,
    recomputeDay,
    deleteMoodPoint,
    initialize,
    clearMoodData,

    // Utilities
    formatDate,
    getToday,
  };
});
