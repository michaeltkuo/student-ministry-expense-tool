import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  onCapture: (file: File) => void
}

export default function CameraCapture({ onCapture }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onCapture(file)
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Receipt preview" className="w-full max-h-80 object-contain rounded-lg border border-black/10" />
          <button
            type="button"
            onClick={() => {
              setPreview(null)
              if (inputRef.current) inputRef.current.value = ''
              inputRef.current?.click()
            }}
            className="mt-2 text-sm text-cru-turquoise hover:underline"
          >
            Change photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'w-full border-2 border-dashed border-black/20 rounded-xl p-10',
            'flex flex-col items-center gap-3 text-cru-graphite',
            'hover:border-cru-cyan hover:text-cru-turquoise transition-colors',
          )}
        >
          <Camera size={48} />
          <span className="text-lg font-medium">Take a photo or upload</span>
          <span className="text-sm">Tap to open camera or choose a file</span>
        </button>
      )}
    </div>
  )
}
