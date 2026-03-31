import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const CATEGORIES = [
  'Meals & Entertainment',
  'Transportation',
  'Lodging',
  'Supplies & Materials',
  'Registration & Fees',
  'Other',
]

export interface ReceiptFormData {
  vendor: string
  transaction_date: string
  amount: string
  currency: string
  category: string
  description: string
}

interface Props {
  defaultValues?: Partial<ReceiptFormData>
  onSubmit: (data: ReceiptFormData) => void
  submitLabel?: string
  loading?: boolean
}

export default function ReceiptForm({ defaultValues, onSubmit, submitLabel = 'Submit', loading }: Props) {
  const { register, handleSubmit, reset } = useForm<ReceiptFormData>({
    defaultValues: { currency: 'USD', ...defaultValues },
  })

  useEffect(() => {
    if (defaultValues) reset({ currency: 'USD', ...defaultValues })
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-cru-black mb-1">Vendor</label>
        <input {...register('vendor')} type="text" placeholder="Store or restaurant name" className="cru-input" />
      </div>
      <div>
        <label className="block text-sm font-medium text-cru-black mb-1">Date</label>
        <input {...register('transaction_date')} type="date" className="cru-input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-cru-black mb-1">Amount</label>
          <input {...register('amount')} type="number" step="0.01" placeholder="0.00" className="cru-input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-cru-black mb-1">Currency</label>
          <input
            {...register('currency')}
            type="text"
            readOnly
            className="w-full border border-black/10 rounded-lg px-3 py-2 bg-cru-gray text-cru-graphite"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-cru-black mb-1">Category</label>
        <select {...register('category')} className="cru-input">
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-cru-black mb-1">Description / Notes</label>
        <textarea {...register('description')} rows={3} placeholder="Brief description of the purchase" className="cru-input" />
      </div>
      <button type="submit" disabled={loading} className="cru-button-primary w-full">
        {loading ? 'Submitting...' : submitLabel}
      </button>
    </form>
  )
}
