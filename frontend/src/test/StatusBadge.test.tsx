import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '../components/admin/StatusBadge'

describe('StatusBadge', () => {
  it('renders Pending for pending status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders Payment Submitted for payment_submitted status', () => {
    render(<StatusBadge status="payment_submitted" />)
    expect(screen.getByText('Payment Submitted')).toBeInTheDocument()
  })

  it('renders Approved for approved status', () => {
    render(<StatusBadge status="approved" />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('renders Rejected for rejected status', () => {
    render(<StatusBadge status="rejected" />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })
})
