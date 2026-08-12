import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Goal } from '@/types'
import {
  createGoal as createGoalRequest,
  deleteGoal as deleteGoalRequest,
  listGoals as listGoalsRequest,
  updateGoal as updateGoalRequest,
  type GoalFilters,
  type GoalInput,
} from '@/services/goals'

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])
  const loading = ref(false)
  const error = ref('')
  const filters = ref<GoalFilters>({ courseId: 'all', status: 'all', search: '' })
  let fetched = false

  const filteredGoals = computed(() =>
    goals.value.filter((goal) => {
      if (filters.value.courseId && filters.value.courseId !== 'all' && goal.courseId !== filters.value.courseId) {
        return false
      }
      if (filters.value.status && filters.value.status !== 'all' && goal.status !== filters.value.status) {
        return false
      }
      if (filters.value.search) {
        const needle = filters.value.search.toLowerCase()
        const haystack = `${goal.title} ${goal.description ?? ''}`.toLowerCase()
        if (!haystack.includes(needle)) {
          return false
        }
      }
      return true
    }),
  )

  async function fetchGoals(force = false): Promise<void> {
    if (fetched && !force) {
      return
    }
    loading.value = true
    error.value = ''
    try {
      goals.value = await listGoalsRequest()
      fetched = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load goals'
    } finally {
      loading.value = false
    }
  }

  async function createGoal(input: GoalInput): Promise<Goal | null> {
    error.value = ''
    try {
      const goal = await createGoalRequest(input)
      goals.value = [goal, ...goals.value]
      return goal
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to create goal'
      return null
    }
  }

  async function updateGoal(id: string, input: GoalInput): Promise<Goal | null> {
    error.value = ''
    try {
      const updated = await updateGoalRequest(id, input)
      goals.value = goals.value.map((goal) => (goal.id === id ? updated : goal))
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to update goal'
      return null
    }
  }

  async function removeGoal(id: string): Promise<boolean> {
    error.value = ''
    try {
      await deleteGoalRequest(id)
      goals.value = goals.value.filter((goal) => goal.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to delete goal'
      return false
    }
  }

  function setFilters(partial: Partial<GoalFilters>): void {
    filters.value = { ...filters.value, ...partial }
  }

  return {
    goals,
    loading,
    error,
    filters,
    filteredGoals,
    fetchGoals,
    createGoal,
    updateGoal,
    removeGoal,
    setFilters,
  }
})
