import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserInterface } from "@shared/types";

interface AuthState {
  user: UserInterface | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: UserInterface | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // This will be replaced with actual Firebase auth
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response
      const mockUser: UserInterface = {
        _id: "mock-id" as any,
        email,
        username: email.split("@")[0],
        name: email.split("@")[0],
        image: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = "mock-token-" + Math.random();

      // Save to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      await AsyncStorage.setItem("token", mockToken);

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, username: string) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: UserInterface = {
        _id: ("mock-id-" + Math.random()) as any,
        email,
        username,
        name: username,
        image: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = "mock-token-" + Math.random();

      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      await AsyncStorage.setItem("token", mockToken);

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      throw error;
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const [userStr, token] = await Promise.all([
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("token"),
      ]);

      if (userStr && token) {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setToken: (token: string | null) => {
    set({ token });
  },
}));
