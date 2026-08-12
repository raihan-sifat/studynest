import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  listTasks as listTasksRequest,
  patchTaskStatus as patchTaskStatusRequest,
  updateTask as updateTaskRequest,
  type TaskFilters,
  type TaskInput,
} from '@/services/tasks'

export type TaskSortKey = 'created' | 'dueDate' | 'priority' | 'title'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref('')
  const filters = ref<TaskFilters>({ courseId: 'all', status: 'all', search: '' })
  const sortKey = ref<TaskSortKey>('created')
  let fetched = false

  const priorityWeight: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

  const filteredTasks = computed(() => {
    const filtered = tasks.value.filter((task) => {
      if (filters.value.courseId && filters.value.courseId !== 'all' && task.courseId !== filters.value.courseId) {
        return false
      }
      if (filters.value.status && filters.value.status !== 'all' && task.status !== filters.value.status) {
        return false
      }
      if (filters.value.search) {
        const needle = filters.value.search.toLowerCase()
        const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase()
        if (!haystack.includes(needle)) {
          return false
        }
      }
      return true
    })
    const sorted = [...filtered]
    switch (sortKey.value) {
      case 'dueDate':
        sorted.sort((a, b) => {
          if (a.dueDate === b.dueDate) return 0
          if (a.dueDate === null) return 1
          if (b.dueDate === null) return -1
          return a.dueDate.localeCompare(b.dueDate)
        })
        break
      case 'priority':
        sorted.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority])
        break
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }
    return sorted
  })

  async function fetchTasks(force = false): Promise<void> {
    if (fetched && !force) {
      return
    }
    loading.value = true
    error.value = ''
    try {
      tasks.value = await listTasksRequest()
      fetched = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load tasks'
    } finally {
      loading.value = false
    }
  }

  async function createTask(input: TaskInput): Promise<Task | null> {
    error.value = ''
    try {
      const task = await createTaskRequest(input)
      tasks.value = [task, ...tasks.value]
      return task
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to create task'
      return null
    }
  }

  async function updateTask(id: string, input: TaskInput): Promise<Task | null> {
    error.value = ''
    try {
      const updated = await updateTaskRequest(id, input)
      tasks.value = tasks.value.map((task) => (task.id === id ? updated : task))
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to update task'
      return null
    }
  }

  async function toggleStatus(id: string): Promise<boolean> {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) {
      return false
    }
    const next: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    error.value = ''
    try {
      const updated = await patchTaskStatusRequest(id, next)
      tasks.value = tasks.value.map((item) => (item.id === id ? updated : item))
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to update task'
      return false
    }
  }

  async function removeTask(id: string): Promise<boolean> {
    error.value = ''
    try {
      await deleteTaskRequest(id)
      tasks.value = tasks.value.filter((task) => task.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to delete task'
      return false
    }
  }

  function setFilters(partial: Partial<TaskFilters>): void {
    filters.value = { ...filters.value, ...partial }
  }

  return {
    tasks,
    loading,
    error,
    filters,
    sortKey,
    filteredTasks,
    fetchTasks,
    createTask,
    updateTask,
    toggleStatus,
    removeTask,
    setFilters,
  }
})
