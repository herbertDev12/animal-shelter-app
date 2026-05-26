import { create } from 'zustand'

interface AppState {
  count: number
  inc: () => void
  dec: () => void
}

export const useBoundStore = create<AppState>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
}))