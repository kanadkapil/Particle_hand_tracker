import { create } from 'zustand'

export const useStore = create((set) => ({
  hands: [], // Array of { id, position: {x,y,z}, gesture, pinchDistance }
  setHands: (hands) => set({ hands }),
  gameScore: 0,
  setGameScore: (score) => set({ gameScore: score }),
  gameActive: false,
  setGameActive: (active) => set({ gameActive: active }),
  trackerStatus: 'Initializing...',
  setTrackerStatus: (status) => set({ trackerStatus: status }),
}))
