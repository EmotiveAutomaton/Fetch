import { create } from 'zustand'

interface State {
    mode: 'public' | 'private'
    setMode: (mode: 'public' | 'private') => void
}

export const useStore = create<State>((set) => ({
    mode: 'public',
    setMode: (mode) => set({ mode }),
}))
