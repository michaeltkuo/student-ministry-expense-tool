import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'
import { renderWithQueryClient } from './test/test-utils'


describe('App routing', () => {
  it('redirects unauthenticated admin route to login', async () => {
    window.history.pushState({}, '', '/admin/submissions')

    renderWithQueryClient(<App />)

    expect(await screen.findByText('Admin Portal')).toBeInTheDocument()
    expect(screen.getByText('Student Ministry Expense Tool')).toBeInTheDocument()
  })

  it('renders student page on root route', async () => {
    window.history.pushState({}, '', '/')

    renderWithQueryClient(<App />)

    expect(await screen.findByText('Submit a Receipt')).toBeInTheDocument()
    expect(screen.getByText('For Student Ministry Expense Reporting')).toBeInTheDocument()
  })
})
