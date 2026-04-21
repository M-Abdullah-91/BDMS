import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ??
  'http://10.0.2.2:8000/api';

export const ACCESS_KEY = 'vs_access';
export const REFRESH_KEY = 'vs_refresh';

export const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(ACCESS_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await AsyncStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;
  try {
    const resp = await axios.post(`${apiBaseUrl}/auth/refresh/`, { refresh });
    const access = resp.data?.access;
    if (access) {
      await AsyncStorage.setItem(ACCESS_KEY, access);
      return access;
    }
  } catch {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  }
  return null;
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) refreshing = refreshAccessToken();
      const newAccess = await refreshing;
      refreshing = null;
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
