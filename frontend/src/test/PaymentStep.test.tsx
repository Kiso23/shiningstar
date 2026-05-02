import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PaymentStep from '../components/registration/PaymentStep'

vi.mock('../api/registrations', () => ({
  uploadPayment: vi.fn(),
}))

vi.mock('../store/registrationStore', () => ({
  useRegistrationStore: () => ({
    registrationId: 'SSU-20250101-TEST01',
  }),
}))

import { uploadPayment } from '../api/registrations'

describe('PaymentStep', () => {
  const onNext = vi.fn()
  const onBack = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows error when submitting without uploading a file', async () => {
    render(<PaymentStep onNext={onNext} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /submit registration/i }))
    await waitFor(() => {
      expect(screen.getByText(/please upload your payment screenshot/i)).toBeInTheDocument()
    })
    expect(onNext).not.toHaveBeenCalled()
  })

  it('displays UPI ID prominently', () => {
    render(<PaymentStep onNext={onNext} onBack={onBack} />)
    expect(screen.getByText(/shiningstarunited@upi/i)).toBeInTheDocument()
  })

  it('lists accepted UPI apps', () => {
    render(<PaymentStep onNext={onNext} onBack={onBack} />)
    expect(screen.getByText(/google pay/i)).toBeInTheDocument()
    expect(screen.getByText(/phonepe/i)).toBeInTheDocument()
    expect(screen.getByText(/paytm/i)).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    render(<PaymentStep onNext={onNext} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
