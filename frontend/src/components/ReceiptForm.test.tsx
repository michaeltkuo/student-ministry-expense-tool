import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ReceiptForm from './ReceiptForm'
import { renderWithQueryClient } from '../test/test-utils'

describe('ReceiptForm', () => {
  it('renders defaults and submits edited values', async () => {
    const onSubmit = vi.fn()

    renderWithQueryClient(
      <ReceiptForm
        defaultValues={{
          vendor: 'Costco',
          transaction_date: '2026-03-25',
          amount: '12.50',
          currency: 'USD',
          category: 'Meals & Entertainment',
          description: 'Lunch',
        }}
        onSubmit={onSubmit}
      />,
    )

    const vendorInput = screen.getByPlaceholderText('Store or restaurant name')
    fireEvent.change(vendorInput, { target: { value: 'Target' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      vendor: 'Target',
      transaction_date: '2026-03-25',
      amount: '12.50',
      currency: 'USD',
    })
  })
})
