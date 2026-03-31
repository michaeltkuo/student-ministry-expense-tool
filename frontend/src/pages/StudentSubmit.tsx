import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import MinistrySelect from '../components/MinistrySelect'
import CameraCapture from '../components/CameraCapture'
import ReceiptForm, { ReceiptFormData } from '../components/ReceiptForm'
import { processReceipt, createSubmission, ExtractedData } from '../api/submissions'

type Step = 1 | 2 | 3

export default function StudentSubmit() {
  const [step, setStep] = useState<Step>(1)
  const [ministryId, setMinistryId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleStep1Next = () => {
    if (!ministryId) { setError('Please select a ministry'); return }
    if (!studentName.trim()) { setError('Please enter your name'); return }
    setError('')
    setStep(2)
  }

  const handleProcess = async () => {
    if (!imageFile) { setError('Please select a photo'); return }
    setError('')
    setProcessing(true)
    try {
      const data = await processReceipt(imageFile)
      setExtractedData(data)
      setStep(3)
    } catch {
      setExtractedData(null)
      setStep(3)
    } finally {
      setProcessing(false)
    }
  }

  const handleSubmit = async (formData: ReceiptFormData) => {
    setSubmitting(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('ministry_id', ministryId)
      fd.append('student_name', studentName)
      if (formData.vendor) fd.append('vendor', formData.vendor)
      if (formData.transaction_date) fd.append('transaction_date', formData.transaction_date)
      if (formData.amount) fd.append('amount', formData.amount)
      fd.append('currency', formData.currency || 'USD')
      if (formData.category) fd.append('category', formData.category)
      if (formData.description) fd.append('description', formData.description)
      if (imageFile) fd.append('file', imageFile)
      if (extractedData) fd.append('raw_ai_response', JSON.stringify(extractedData))
      await createSubmission(fd)
      setSubmitted(true)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetAll = () => {
    setStep(1)
    setMinistryId('')
    setStudentName('')
    setImageFile(null)
    setExtractedData(null)
    setSubmitted(false)
    setError('')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cru-gray flex items-center justify-center p-4">
        <div className="cru-card p-8 max-w-md w-full text-center">
          <img src="/brand/cru-logo-home.png" alt="Cru logo" className="mx-auto h-14 w-auto mb-5" />
          <CheckCircle className="mx-auto mb-3 text-cru-orange" size={56} />
          <h2 className="text-2xl font-heading font-bold text-cru-black mb-2">Receipt Submitted!</h2>
          <p className="text-cru-graphite mb-6">Your expense has been submitted for review.</p>
          <button onClick={resetAll} className="cru-button-primary w-full">Submit Another Receipt</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cru-gray flex items-center justify-center p-4">
      <div className="cru-card p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <img src="/brand/cru-logo-home.png" alt="Cru logo" className="mx-auto h-12 w-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-cru-black">Submit a Receipt</h1>
          <p className="text-cru-graphite text-sm mt-1">For Student Ministry Expense Reporting</p>
          <div className="flex justify-center gap-2 mt-4">
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-colors ${step >= s ? 'bg-cru-orange' : 'bg-black/10'}`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cru-black mb-1">Ministry</label>
              <MinistrySelect value={ministryId} onChange={setMinistryId} className="cru-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-cru-black mb-1">Your Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="cru-input"
              />
            </div>
            <button onClick={handleStep1Next} className="cru-button-primary w-full">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-cru-graphite text-center">Take a photo or upload your receipt</p>
            <CameraCapture onCapture={setImageFile} />
            {processing && (
              <div className="flex items-center justify-center gap-2 text-cru-turquoise py-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Extracting receipt data...</span>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="cru-button-secondary flex-1">Back</button>
              <button
                type="button"
                onClick={handleProcess}
                disabled={!imageFile || processing}
                className="cru-button-primary flex-1"
              >
                Process Receipt
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Receipt"
                className="w-full max-h-40 object-contain rounded-lg border border-black/10"
              />
            )}
            <p className="text-sm text-cru-graphite">Review and edit the extracted information below:</p>
            <ReceiptForm
              defaultValues={{
                vendor: extractedData?.vendor ?? '',
                transaction_date: extractedData?.date ?? '',
                amount: extractedData?.amount != null ? String(extractedData.amount) : '',
                currency: extractedData?.currency ?? 'USD',
                category: extractedData?.category ?? '',
                description: extractedData?.description ?? '',
              }}
              onSubmit={handleSubmit}
              submitLabel="Submit Receipt"
              loading={submitting}
            />
            <button type="button" onClick={() => setStep(2)} className="cru-button-secondary w-full py-2 text-sm">Back</button>
          </div>
        )}
      </div>
    </div>
  )
}
