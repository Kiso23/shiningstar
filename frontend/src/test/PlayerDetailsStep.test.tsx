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
      // The component shows "Name is required" for empty full_name fields
      expect(screen.getAllByText(/name is required/i).length).toBeGreaterThan(0)
    })
  })

  it('calls submitPlayers and onNext on valid submission', async () => {
    vi.mocked(submitPlayers).mockResolvedValue(undefined)
    render(<PlayerDetailsStep onNext={onNext} onBack={onBack} />)

    // Fill all 11 required players
    const nameInputs = screen.getAllByPlaceholderText(/player name/i)
    const ageInputs = screen.getAllByPlaceholderText(/age/i)
    const jerseyInputs = screen.getAllByPlaceholderText(/e\.g\. 10/i)
    const positionSelects = screen.getAllByRole('combobox')

    // Fill first 3 (enough to test the flow — mock returns success)
    for (let i = 0; i < Math.min(3, nameInputs.length); i++) {
      fireEvent.change(nameInputs[i], { target: { value: `Player ${i + 1}` } })
      fireEvent.change(ageInputs[i], { target: { value: '20' } })
      fireEvent.change(jerseyInputs[i], { target: { value: `${i + 1}` } })
      fireEvent.change(positionSelects[i], { target: { value: 'Midfielder' } })
    }

    // Fill remaining required players (4-11)
    for (let i = 3; i < nameInputs.length && i < 11; i++) {
      fireEvent.change(nameInputs[i], { target: { value: `Player ${i + 1}` } })
      fireEvent.change(ageInputs[i], { target: { value: '20' } })
      fireEvent.change(jerseyInputs[i], { target: { value: `${i + 1}` } })
      fireEvent.change(positionSelects[i], { target: { value: 'Midfielder' } })
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
