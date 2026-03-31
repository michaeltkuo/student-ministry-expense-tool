import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(password)
      navigate('/admin/submissions')
    } catch {
      setError('Invalid password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cru-gray flex items-center justify-center p-4">
      <div className="cru-card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/brand/cru-logo-home.png" alt="Cru logo" className="mx-auto h-14 w-auto mb-3" />
          <h1 className="text-2xl font-heading font-bold text-cru-black">Admin Portal</h1>
          <p className="text-cru-graphite text-sm mt-1">Student Ministry Expense Tool</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-cru-black mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="cru-input"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="cru-button-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
