import client from './client'

export interface Submission {
  id: number
  ministry_id: number
  ministry_name?: string
  student_name: string
  vendor?: string
  transaction_date?: string
  amount?: number
  currency: string
  category?: string
  description?: string
  image_path?: string
  status: string
  raw_ai_response?: string
  created_at: string
  updated_at: string
}

export interface ExtractedData {
  vendor?: string
  date?: string
  amount?: number
  currency: string
  category?: string
  description?: string
}

export interface SubmissionFilters {
  ministry_id?: number
  status?: string
  from_date?: string
  to_date?: string
  page?: number
  per_page?: number
}

export async function processReceipt(file: File): Promise<ExtractedData> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await client.post('/process-receipt', formData)
  return data
}

export async function createSubmission(formData: FormData): Promise<Submission> {
  const { data } = await client.post('/submissions', formData)
  return data
}

export async function getSubmissions(filters: SubmissionFilters = {}): Promise<Submission[]> {
  const { data } = await client.get('/submissions', { params: filters })
  return data
}

export async function getSubmission(id: number): Promise<Submission> {
  const { data } = await client.get(`/submissions/${id}`)
  return data
}

export async function updateSubmission(id: number, updates: Partial<Submission>): Promise<Submission> {
  const { data } = await client.patch(`/submissions/${id}`, updates)
  return data
}

export async function deleteSubmission(id: number): Promise<void> {
  await client.delete(`/submissions/${id}`)
}

export async function exportCSV(filters: SubmissionFilters = {}): Promise<void> {
  const response = await client.get('/export', {
    params: filters,
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'expense_report.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
