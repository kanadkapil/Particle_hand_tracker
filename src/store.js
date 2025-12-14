import { create } from 'zustand'

export const useStore = create((set) => ({
  hand: null, // { position: {x,y,z}, gesture: 'open'|'closed'|'pinch', pinchDistance: number }
  setHand: (hand) => set({ hand }),
}))
