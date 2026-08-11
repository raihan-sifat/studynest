<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ArrowLeft, BookOpen, CalendarDays, CheckSquare, ListTodo, Pencil, StickyNote, Target } from '@lucide/vue'
import { useCoursesStore } from '@/stores/courses'
import type { Course } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import CourseFormModal from '@/components/courses/CourseFormModal.vue'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()

const courseId = computed(() => String(route.params.id ?? ''))
const course = ref<Course | null>(null)
const loading = ref(true)
const notFound = ref(false)
const formOpen = ref(false)

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

async function load(): Promise<void> {
  loading.value = true
  notFound.value = false
  const cached = coursesStore.byId.get(courseId.value)
  if (cached) {
    course.value = cached
  }
  const fetched = await coursesStore.fetchCourse(courseId.value)
  if (fetched) {
    course.value = fetched
  } else if (!cached) {
    notFound.value = true
  }
  loading.value = false
}

onMounted(load)
watch(courseId, load)

function formattedDate(date: string | null): string {
  return date ? format(new Date(`${date}T00:00:00`), 'MMM d, yyyy') : ''
}
</script>

<template>
  <div>
    <button
      class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
      @click="router.push({ name: 'courses' })"
    >
      <ArrowLeft :size="16" />
      All courses
    </button>

    <div v-if="loading" class="space-y-4">
      <div class="h-10 w-2/3 animate-pulse rounded-lg bg-surface" />
      <div class="h-40 animate-pulse rounded-xl bg-surface" />
    </div>

    <template v-else-if="course">
      <PageHeader :title="course.title" :description="course.description ?? undefined">
        <BaseButton size="sm" variant="secondary" @click="formOpen = true">
          <Pencil :size="16" />
          Edit
        </BaseButton>
      </PageHeader>

      <div class="flex flex-wrap items-center gap-3">
        <div class="h-4 w-4 rounded-full" :style="{ backgroundColor: course.color }" aria-hidden="true" />
        <BaseBadge :tone="course.status === 'active' ? 'soft' : course.status === 'completed' ? 'accent' : 'neutral'">
          {{ statusLabels[course.status] }}
        </BaseBadge>
        <span v-if="course.targetDate" class="inline-flex items-center gap-1.5 text-sm text-secondary">
          <CalendarDays :size="16" />
          Target: {{ formattedDate(course.targetDate) }}
        </span>
        <span class="text-sm text-muted">Created {{ formattedDate(course.createdAt.slice(0, 10)) }}</span>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <BaseCard>
          <div class="flex items-center gap-2">
            <ListTodo :size="18" class="text-accent" />
            <h3 class="font-semibold text-primary">Tasks</h3>
          </div>
          <EmptyState
            :icon="CheckSquare"
            title="No tasks yet"
            description="Tasks for this course will appear here in Milestone 5."
          />
        </BaseCard>

        <BaseCard>
          <div class="flex items-center gap-2">
            <StickyNote :size="18" class="text-accent" />
            <h3 class="font-semibold text-primary">Notes</h3>
          </div>
          <EmptyState
            :icon="BookOpen"
            title="No notes yet"
            description="Bilingual notes for this course will appear here in Milestone 6."
          />
        </BaseCard>

        <BaseCard>
          <div class="flex items-center gap-2">
            <Target :size="18" class="text-accent" />
            <h3 class="font-semibold text-primary">Goals</h3>
          </div>
          <EmptyState
            :icon="Target"
            title="No goals yet"
            description="Goals for this course will appear here in Milestone 8."
          />
        </BaseCard>

        <BaseCard>
          <div class="flex items-center gap-2">
            <CalendarDays :size="18" class="text-accent" />
            <h3 class="font-semibold text-primary">Study sessions</h3>
          </div>
          <EmptyState
            :icon="CalendarDays"
            title="No sessions yet"
            description="Study sessions for this course will appear here in Milestone 7."
          />
        </BaseCard>
      </div>

      <CourseFormModal :open="formOpen" :course="course" @close="formOpen = false" @saved="load" />
    </template>

    <div v-else-if="notFound" class="rounded-xl border border-border bg-surface shadow-card">
      <EmptyState
        :icon="BookOpen"
        title="Course not found"
        description="This course doesn't exist or you don't have access to it."
      >
        <BaseButton size="sm" variant="secondary" @click="router.push({ name: 'courses' })">
          Back to courses
        </BaseButton>
      </EmptyState>
    </div>
  </div>
</template>
