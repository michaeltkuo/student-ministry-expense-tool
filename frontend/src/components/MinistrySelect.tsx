import { useQuery } from '@tanstack/react-query'
import { getMinistries } from '../api/ministries'

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function MinistrySelect({ value, onChange, className }: Props) {
  const { data: ministries = [], isLoading } = useQuery({
    queryKey: ['ministries'],
    queryFn: getMinistries,
  })

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      disabled={isLoading}
    >
      <option value="">Select your ministry</option>
      {ministries.map((m) => (
        <option key={m.id} value={String(m.id)}>
          {m.name}
        </option>
      ))}
    </select>
  )
}
