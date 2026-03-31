import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import clsx from 'clsx'
import { getSubmissions, exportCSV, SubmissionFilters } from '../../api/submissions'
import { getMinistries } from '../../api/ministries'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-cru-yellow/20 text-cru-black',
  reviewed: 'bg-cru-cyan/20 text-cru-navy',
  exported: 'bg-cru-orange/20 text-cru-black',
}

export default function SubmissionList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SubmissionFilters>({})
  const [exporting, setExporting] = useState(false)

  const { data: submissions = [], isLoading, refetch } = useQuery({
    queryKey: ['submissions', filters],
    queryFn: () => getSubmissions(filters),
  })
  const { data: ministries = [] } = useQuery({ queryKey: ['ministries'], queryFn: getMinistries })

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportCSV(filters)
      refetch()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-cru-black">Expense Submissions</h1>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-cru-black text-cru-yellow px-4 py-2 rounded-lg font-medium hover:bg-cru-navy disabled:opacity-50 transition-colors"
        >
          <Download size={18} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="cru-card p-4 mb-4 flex flex-wrap gap-3">
        <select
          value={filters.ministry_id ?? ''}
          onChange={(e) => setFilters(f => ({ ...f, ministry_id: e.target.value ? Number(e.target.value) : undefined }))}
          className="cru-input text-sm"
        >
          <option value="">All Ministries</option>
          {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select
          value={filters.status ?? ''}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value || undefined }))}
          className="cru-input text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="exported">Exported</option>
        </select>
        <input
          type="date"
          value={filters.from_date ?? ''}
          onChange={(e) => setFilters(f => ({ ...f, from_date: e.target.value || undefined }))}
          className="cru-input text-sm"
          placeholder="From date"
        />
        <input
          type="date"
          value={filters.to_date ?? ''}
          onChange={(e) => setFilters(f => ({ ...f, to_date: e.target.value || undefined }))}
          className="cru-input text-sm"
          placeholder="To date"
        />
      </div>

      <div className="cru-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-cru-graphite">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-cru-graphite">No submissions found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-cru-gray/80">
                <th className="text-left px-4 py-3 text-xs font-semibold text-cru-graphite uppercase">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cru-graphite uppercase">Ministry</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cru-graphite uppercase">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cru-graphite uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-cru-graphite uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cru-graphite uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-cru-graphite uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub.id}
                  onClick={() => navigate(`/admin/submissions/${sub.id}`)}
                  className="border-b hover:bg-cru-gray/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-cru-black">{sub.student_name}</td>
                  <td className="px-4 py-3 text-sm text-cru-graphite">{sub.ministry_name}</td>
                  <td className="px-4 py-3 text-sm text-cru-graphite">{sub.vendor || '—'}</td>
                  <td className="px-4 py-3 text-sm text-cru-graphite">{sub.transaction_date || '—'}</td>
                  <td className="px-4 py-3 text-sm text-cru-black text-right">{sub.amount != null ? `$${sub.amount.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-1 rounded-full text-xs font-semibold', STATUS_COLORS[sub.status] ?? 'bg-black/10 text-cru-graphite')}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-cru-graphite">{new Date(sub.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
