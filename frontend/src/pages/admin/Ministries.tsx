import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { getMinistries, createMinistry, updateMinistry, deleteMinistry } from '../../api/ministries'

export default function Ministries() {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  const { data: ministries = [], isLoading } = useQuery({
    queryKey: ['ministries'],
    queryFn: getMinistries,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ministries'] })

  const createMutation = useMutation({
    mutationFn: createMinistry,
    onSuccess: () => { setNewName(''); setError(''); invalidate() },
    onError: (e: any) => setError(e.response?.data?.detail || 'Error creating ministry'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateMinistry(id, name),
    onSuccess: () => { setEditId(null); invalidate() },
  })

  const deleteMutation = useMutation({ mutationFn: deleteMinistry, onSuccess: invalidate })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    createMutation.mutate(newName.trim())
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-cru-black mb-6">Ministries</h1>

      <div className="cru-card p-6 mb-6">
        <h2 className="font-semibold text-cru-black mb-3">Add Ministry</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ministry name"
            className="cru-input flex-1"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 bg-cru-black text-cru-yellow px-4 py-2 rounded-lg hover:bg-cru-navy disabled:opacity-50 transition-colors"
          >
            <Plus size={18} />
            Add
          </button>
        </form>
        {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
      </div>

      <div className="cru-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-cru-graphite">Loading...</div>
        ) : ministries.length === 0 ? (
          <div className="p-8 text-center text-cru-graphite">No ministries yet.</div>
        ) : (
          <ul className="divide-y divide-black/10">
            {ministries.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-4">
                {editId === m.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="cru-input flex-1 py-1"
                      autoFocus
                    />
                    <button onClick={() => updateMutation.mutate({ id: m.id, name: editName })} className="p-1 text-cru-turquoise hover:text-cru-navy">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditId(null)} className="p-1 text-cru-graphite hover:text-cru-black">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-cru-black">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditId(m.id); setEditName(m.name) }}
                        className="p-1 text-cru-graphite hover:text-cru-turquoise transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${m.name}"?`)) deleteMutation.mutate(m.id)
                        }}
                        className="p-1 text-cru-graphite hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
