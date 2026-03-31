import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import CameraCapture from './CameraCapture'
import { renderWithQueryClient } from '../test/test-utils'

describe('CameraCapture', () => {
  it('calls onCapture and shows preview after upload', async () => {
    const user = userEvent.setup()
    const onCapture = vi.fn()

    renderWithQueryClient(<CameraCapture onCapture={onCapture} />)

    const file = new File(['fake-image'], 'receipt.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => expect(onCapture).toHaveBeenCalledTimes(1))
    expect(onCapture).toHaveBeenCalledWith(file)
    expect(screen.getByAltText('Receipt preview')).toBeInTheDocument()
  })
})
