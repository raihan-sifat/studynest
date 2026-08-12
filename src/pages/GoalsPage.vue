<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { Flag, Pencil, Plus, Search, Target, Trash2 } from '@lucide/vue'
import { useGoalsStore } from '@/stores/goals'
import { useCoursesStore } from '@/stores/courses'
import type { Goal } from '@/types'
import { daysUntilDeadline, goalPhase, goalProgressPercent } from '@/utils/progress'
import type { GoalPhase } from '@/utils/progress'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'

const goalsStore = useGoalsStore()
const coursesStore = useCoursesStore()

const formOpen = ref(false)
const editingGoal = ref<Goal | null>(null)
const deletingGoal = ref<Goal | null>(null)
const deleting = ref(false)

const courseOptions = computed(() => [
  { value: 'all', label: 'All courses' },
  ...coursesStore.courses.map((course) => ({ value: course.id, label: course.title })),
])

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'achieved', label: 'Achieved' },
  { value: 'archived', label: 'Archived' },
]

const phaseLabels: Record<GoalPhase, string> = {
  active: 'Active',
  overdue: 'Overdue',
  achieved: 'Achieved',
  archived: 'Archived',
}

const phaseTones: Record<GoalPhase, 'accent' | 'soft' | 'neutral' | 'danger'> = {
  active: 'soft',
  overdue: 'danger',
  achieved: 'accent',
  archived: 'neutral',
}

const courseTitle = (courseId: string | null) =>
  courseId ? coursesStore.byId.get(courseId)?.title ?? 'Unknown course' : ''

const courseColor = (courseId: string | null) => coursesStore.byId.get(courseId ?? '')?.color ?? ''

const progressOf = (goal: Goal) => goalProgressPercent(goal.currentValue, goal.targetValue)

const deadlineText = (goal: Goal): string | null => {
  if (!goal.deadline) {
    return null
  }
  const days = daysUntilDeadline(goal.deadline)
  if (goal.status === 'achieved') {
    return format(new Date(`${goal.deadline}T00:00:00`), 'MMM d, yyyy')
  }
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
  }
  if (days === 0) {
    return 'Due today'
  }
  return `In ${days} day${days === 1 ? '' : 's'}`
}

onMounted(async () => {
  await Promise.all([goalsStore.fetchGoals(), coursesStore.fetchCourses()])
})

function openCreate(): void {
  editingGoal.value = null
  formOpen.value = true
}

function openEdit(goal: Goal): void {
  editingGoal.value = goal
  formOpen.value = true
}

function closeForm(): void {
  formOpen.value = false
  editingGoal.value = null
}

async function confirmDelete(): Promise<void> {
  const goal = deletingGoal.value
  if (!goal) {
    return
  }
  deleting.value = true
  const ok = await goalsStore.removeGoal(goal.id)
  deleting.value = false
  if (ok) {
    deletingGoal.value = null
  }
}

function clearFilters(): void {
  goalsStore.setFilters({ courseId: 'all', status: 'all', search: '' })
}
</script>

<template>
  <div>
    <PageHeader title="Goals" description="Targets, deadlines, and progress.">
      <BaseButton size="sm" @click="openCreate">
        <Plus :size="16" />
        New goal
      </BaseButton>
    </PageHeader>

    <p v-if="goalsStore.error" class="mb-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
      {{ goalsStore.error }}
    </p>

    <div class="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-card sm:flex-row sm:items-end">
      <div class="flex-1">
        <BaseInput v-model="goalsStore.filters.search" label="Search" placeholder="Search goals…" />
      </div>
      <div class="grid grid-cols-2 gap-3 sm:flex">
        <BaseSelect v-model="goalsStore.filters.courseId" label="Course" :options="courseOptions" />
        <BaseSelect v-model="goalsStore.filters.status" label="Status" :options="statusOptions" />
      </div>
    </div>

    <div v-if="goalsStore.loading" class="grid gap-4 sm:grid-cols-2" aria-label="Loading goals">
      <div v-for="i in 4" :key="i" class="h-44 animate-pulse rounded-xl border border-border bg-surface" />
    </div>

    <div
      v-else-if="goalsStore.goals.length === 0"
      class="rounded-xl border border-border bg-surface shadow-card"
    >
      <EmptyState
        :icon="Target"
        title="No goals yet"
        description="Set a target, track your progress, and turn plans into results."
      >
        <BaseButton size="sm" @click="openCreate">
          <Plus :size="16" />
          Create your first goal
        </BaseButton>
      </EmptyState>
    </div>

    <div v-else-if="goalsStore.filteredGoals.length === 0" class="rounded-xl border border-border bg-surface shadow-card">
      <EmptyState
        :icon="Search"
        title="No matching goals"
        description="Try adjusting your search, status, or course filters."
      >
        <BaseButton size="sm" variant="secondary" @click="clearFilters">Clear filters</BaseButton>
      </EmptyState>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <BaseCard v-for="goal in goalsStore.filteredGoals" :key="goal.id" as="article" class="group flex flex-col">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-semibold text-primary">{{ goal.title }}</h3>
          <div class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-primary"
              :aria-label="`Edit ${goal.title}`"
              @click="openEdit(goal)"
            >
              <Pencil :size="16" />
            </button>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              :aria-label="`Delete ${goal.title}`"
              @click="deletingGoal = goal"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <p v-if="goal.description" class="mt-1 line-clamp-2 flex-1 text-sm text-secondary">
          {{ goal.description }}
        </p>

        <div class="mt-4">
          <div class="mb-1.5 flex items-center justify-between text-xs">
            <span class="text-secondary">
              {{ goal.currentValue }} / {{ goal.targetValue }}
            </span>
            <span class="font-semibold" :class="goalPhase(goal) === 'overdue' ? 'text-danger' : 'text-accent'">
              {{ progressOf(goal) }}%
            </span>
          </div>
          <div
            class="h-2 overflow-hidden rounded-full bg-background"
            role="progressbar"
            :aria-valuenow="progressOf(goal)"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Progress of ${goal.title}`"
          >
            <div
              class="h-full rounded-full transition-all"
              :class="goalPhase(goal) === 'overdue' ? 'bg-danger' : 'bg-accent'"
              :style="{ width: `${progressOf(goal)}%` }"
            />
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2 pt-3">
          <BaseBadge :tone="phaseTones[goalPhase(goal)]">
            {{ phaseLabels[goalPhase(goal)] }}
          </BaseBadge>
          <span v-if="goal.courseId" class="inline-flex items-center gap-1.5 text-xs text-secondary">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: courseColor(goal.courseId) }" />
            {{ courseTitle(goal.courseId) }}
          </span>
          <span
            v-if="goal.deadline"
            class="ml-auto inline-flex items-center gap-1 text-xs"
            :class="goalPhase(goal) === 'overdue' ? 'text-danger' : 'text-muted'"
          >
            <Flag :size="13" />
            {{ deadlineText(goal) }}
          </span>
        </div>
      </BaseCard>
    </div>

    <GoalFormModal :open="formOpen" :goal="editingGoal" @close="closeForm" />

    <BaseConfirmDialog
      v-if="deletingGoal"
      title="Delete goal?"
      :message="`Delete “${deletingGoal.title}”? This cannot be undone.`"
      :busy="deleting"
      @close="deletingGoal = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
