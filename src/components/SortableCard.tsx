import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface SortableCardProps {
  id: string
  children: React.ReactNode
}

export default function SortableCard({ id, children }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* ドラッグハンドル */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing p-2 rounded-lg bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-all opacity-30 group-hover:opacity-100 hover:opacity-100"
        style={{ touchAction: 'none' }}
      >
        <GripVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>

      {/* カードコンテンツ */}
      {children}
    </div>
  )
}
