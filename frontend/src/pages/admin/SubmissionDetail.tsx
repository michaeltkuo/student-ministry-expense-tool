import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getSubmission, updateSubmission, deleteSubmission, Submission } from '../../api/submissions'
import ReceiptForm, { ReceiptFormData } from '../../components/ReceiptForm'

const STATUSES = ['pending', 'reviewed', 'exported']

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => getSubmission(Number(id)),
  })

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Submission>) => updateSubmission(Number(id), updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] })
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteSubmission(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      navigate('/admin/submissions')
    },
  })

  const handleFormSubmit = (data: ReceiptFormData) => {
    updateMutation.mutate({
      vendor: data.vendor || undefined,
      transaction_date: data.transaction_date || undefined,
      amount: data.amount ? parseFloat(data.amount) : undefined,
      currency: data.currency,
      category: data.category || undefined,
      description: data.description || undefined,
    })
  }

  if (isLoading) return <div className="p-8 text-center text-cru-graphite">Loading...</div>
  if (!submission) return <div className="p-8 text-center text-red-600">Submission not found.</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/submissions')} className="p-2 hover:bg-white/70 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-heading font-bold text-cru-black">Submission #{submission.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {submission.image_path ? (
            <img src={`/uploads/${submission.image_path}`} alt="Receipt" className="w-full rounded-xl border border-black/10 object-contain max-h-96" />
          ) : (
            <div className="w-full h-64 rounded-xl border-2 border-dashed border-black/15 flex items-center justify-center text-cru-graphite">
              No image
            </div>
          )}
          <div className="cru-card p-4">
            <p className="text-sm text-cru-graphite">Student</p>
            <p className="font-semibold text-cru-black">{submission.student_name}</p>
            <p className="text-sm text-cru-graphite mt-2">Ministry</p>
            <p className="font-semibold text-cru-black">{submission.ministry_name}</p>
          </div>
        </div>

        <div className="cru-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-cru-black mb-1">Status</label>
            <select
              value={submission.status}
              onChange={(e) => updateMutation.mutate({ status: e.target.value })}
              className="cru-input"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <ReceiptForm
            defaultValues={{
              vendor: submission.vendor ?? '',
              transaction_date: submission.transaction_date ?? '',
              amount: submission.amount != null ? String(submission.amount) : '',
              currency: submission.currency ?? 'USD',
              category: submission.category ?? '',
              description: submission.description ?? '',
            }}
            onSubmit={handleFormSubmit}
            submitLabel={updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            loading={updateMutation.isPending}
          />

          {updateMutation.isSuccess && <p className="text-cru-orange text-sm text-center">Changes saved!</p>}

          <div className="pt-4 border-t border-black/10">
            {confirmDelete ? (
              <div className="flex gap-3">
                <button onClick={() => deleteMutation.mutate()} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700">
                  Confirm Delete
                </button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-black/20 py-2 rounded-lg hover:bg-cru-gray">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-red-700 hover:text-red-800 text-sm font-medium">
                <Trash2 size={16} />
                Delete Submission
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
