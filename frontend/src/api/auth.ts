import client from './client'

export async function login(password: string): Promise<string> {
  const { data } = await client.post('/auth/login', { password })
  localStorage.setItem('admin_token', data.access_token)
  return data.access_token
}

export function logout() {
  localStorage.removeItem('admin_token')
  window.location.href = '/admin/login'
}
