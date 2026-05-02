import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PlayerDetailsStep from '../components/registration/PlayerDetailsStep'

vi.mock('../api/registrations', () => ({
  submitPlayers: vi.fn(),
}))

vi.mock('../store/registrationStore', () => ({
  useRegistrationStore: () => ({
    registrationId: 'SSU-20250101-TEST01',
    teamData: { player_count: 3 },
    setPlayerData: vi.fn(),
  }),
}))

import { submitPlayers } from '../api/registrations'

describe('PlayerDetailsStep', () => {
  const onNext = vi.fn()
  const onBack = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correct number of player rows based on player_count', () => {
    render(<PlayerDetailsStep onNext={onNext} onBack={onBack} />)
    // 3 players → 3 "Player N" labels
    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()
    expect(screen.getByText('Player 3')).toBeInTheDocument()
  })

  it('shows validation errors when submitting with missing fields', async () => {
    render(<PlayerDetailsStep onNext={onNext} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/player name is required/i).length).toBeGreaterThan(0)
    })
  })

  it('calls submitPlayers and onNext on valid submission', async () => {
    vi.mocked(submitPlayers).mockResolvedValue(undefined)
    render(<PlayerDetailsStep onNext={onNext} onBack={onBack} />)

    const nameInputs = screen.getAllByPlaceholderText(/player name/i)
    const ageInputs = screen.getAllByPlaceholderText(/age/i)

    for (let i = 0; i < 3; i++) {
      fireEvent.change(nameInputs[i], { target: { value: `Player ${i + 1}` } })
      fireEvent.change(ageInputs[i], { target: { value: '20' } })
    }

    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }))

    await waitFor(() => {
      expect(submitPlayers).toHaveBeenCalledOnce()
      expect(onNext).toHaveBeenCalledOnce()
    })
  })

  it('calls onBack when back button is clicked', () => {
    render(<PlayerDetailsStep onNext={onNext} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
