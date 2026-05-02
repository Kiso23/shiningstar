import { create } from 'zustand'
import type { TeamCreateData, PlayerData } from '../api/registrations'

interface RegistrationState {
  currentStep: number
  registrationId: string | null
  teamData: TeamCreateData | null
  playerData: PlayerData[]
  setStep: (step: number) => void
  setRegistrationId: (id: string) => void
  setTeamData: (data: TeamCreateData) => void
  setPlayerData: (players: PlayerData[]) => void
  reset: () => void
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  currentStep: 1,
  registrationId: null,
  teamData: null,
  playerData: [],
  setStep: (step) => set({ currentStep: step }),
  setRegistrationId: (id) => set({ registrationId: id }),
  setTeamData: (data) => set({ teamData: data }),
  setPlayerData: (players) => set({ playerData: players }),
  reset: () => set({ currentStep: 1, registrationId: null, teamData: null, playerData: [] }),
}))
