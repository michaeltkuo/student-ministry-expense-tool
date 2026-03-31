import client from './client'

export interface Ministry {
  id: number
  name: string
  created_at: string
}

export async function getMinistries(): Promise<Ministry[]> {
  const { data } = await client.get('/ministries')
  return data
}

export async function createMinistry(name: string): Promise<Ministry> {
  const { data } = await client.post('/ministries', { name })
  return data
}

export async function updateMinistry(id: number, name: string): Promise<Ministry> {
  const { data } = await client.patch(`/ministries/${id}`, { name })
  return data
}

export async function deleteMinistry(id: number): Promise<void> {
  await client.delete(`/ministries/${id}`)
}
