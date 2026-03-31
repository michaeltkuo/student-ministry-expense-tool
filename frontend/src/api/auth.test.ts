import { beforeEach, describe, expect, it, vi } from 'vitest'
import client from './client'
import { login } from './auth'

vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('auth api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stores token after successful login', async () => {
    vi.mocked(client.post).mockResolvedValueOnce({ data: { access_token: 'token-123' } } as any)

    const token = await login('changeme')

    expect(client.post).toHaveBeenCalledWith('/auth/login', { password: 'changeme' })
    expect(token).toBe('token-123')
    expect(localStorage.getItem('admin_token')).toBe('token-123')
  })
})
