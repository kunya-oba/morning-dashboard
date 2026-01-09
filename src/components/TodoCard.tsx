import { useState, useEffect } from 'react'
import { CheckSquare, Plus, Trash2, Calendar, Flag, ChevronDown, ChevronUp } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { generateId } from '../utils/uuid'

interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  createdAt: string
}

interface SortableTaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdatePriority: (id: string, priority: Task['priority']) => void
  onUpdateDueDate: (id: string, date: string) => void
}

function SortableTaskItem({ task, onToggle, onDelete, onUpdatePriority, onUpdateDueDate }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const [showDetails, setShowDetails] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // 優先度の色
  const priorityColors = {
    high: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  }

  // 期限チェック
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-l-4 ${priorityColors[task.priority]} rounded-lg p-3 transition-all ${
        task.completed ? 'opacity-60' : ''
      } ${isOverdue ? 'border-red-600' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* ドラッグハンドル */}
        <div {...attributes} {...listeners} className="cursor-move pt-1">
          <div className="w-2 h-8 flex flex-col justify-center gap-1">
            <div className="w-full h-1 bg-gray-400 dark:bg-gray-500 rounded"></div>
            <div className="w-full h-1 bg-gray-400 dark:bg-gray-500 rounded"></div>
            <div className="w-full h-1 bg-gray-400 dark:bg-gray-500 rounded"></div>
          </div>
        </div>

        {/* チェックボックス */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="w-5 h-5 mt-1 rounded cursor-pointer"
        />

        {/* タスク内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-gray-800 dark:text-gray-100 break-words ${
                task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
              }`}
            >
              {task.title}
            </p>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* 期限表示 */}
          {task.dueDate && (
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                {new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                {isOverdue && ' (期限切れ)'}
              </span>
            </div>
          )}

          {/* 詳細設定 */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
              {/* 優先度選択 */}
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-gray-400" />
                <select
                  value={task.priority}
                  onChange={(e) => onUpdatePriority(task.id, e.target.value as Task['priority'])}
                  className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>

              {/* 期限設定 */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={task.dueDate || ''}
                  onChange={(e) => onUpdateDueDate(task.id, e.target.value)}
                  className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />
              </div>

              {/* 削除ボタン */}
              <button
                onClick={() => onDelete(task.id)}
                className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
                削除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TodoCard() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : []
  })
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // LocalStorageに保存
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    }
    setTasks([...tasks, newTask])
    setNewTaskTitle('')
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const updatePriority = (id: string, priority: Task['priority']) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, priority } : task)))
  }

  const updateDueDate = (id: string, dueDate: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, dueDate: dueDate || undefined } : task)))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)
  const displayTasks = showCompleted ? tasks : activeTasks

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <CheckSquare className="w-7 h-7 text-green-500" />
          今日のタスク
        </h2>

        {/* 完了タスク表示切り替え */}
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {showCompleted ? '完了を非表示' : '完了を表示'}
        </button>
      </div>

      {/* 進捗バー */}
      {tasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">進捗</span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {completedTasks.length} / {tasks.length} 完了 ({Math.round(completionRate)}%)
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* タスク追加フォーム */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="新しいタスクを追加..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="新しいタスクを追加"
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
          aria-label="タスクを追加"
        >
          <Plus className="w-5 h-5" />
          追加
        </button>
      </div>

      {/* タスクリスト */}
      {displayTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {tasks.length === 0 ? 'タスクがありません。上のフォームから追加してください。' : '完了したタスクはありません'}
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {displayTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onUpdatePriority={updatePriority}
                  onUpdateDueDate={updateDueDate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 完了メッセージ */}
      {completionRate === 100 && tasks.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-center">
          <p className="text-lg font-bold">🎉 素晴らしい！</p>
          <p className="text-sm">すべてのタスクが完了しました</p>
        </div>
      )}
    </div>
  )
}
