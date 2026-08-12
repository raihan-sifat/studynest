<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BookOpen, Pencil, Plus, Trash2 } from '@lucide/vue'
import { useCoursesStore } from '@/stores/courses'
import { useToastStore } from '@/stores/toast'
import { format } from 'date-fns'
import type { Course } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import CourseFormModal from '@/components/courses/CourseFormModal.vue'

const coursesStore = useCoursesStore()
const toast = useToastStore()

const formOpen = ref(false)
const editingCourse = ref<Course | null>(null)
const deletingCourse = ref<Course | null>(null)
const deleting = ref(false)

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

const visibleCourses = computed(() => {
  const order = ['active', 'completed', 'archived']
  return [...coursesStore.courses].sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status),
  )
})

onMounted(() => coursesStore.fetchCourses())

function openCreate(): void {
  editingCourse.value = null
  formOpen.value = true
}

function openEdit(course: Course): void {
  editingCourse.value = course
  formOpen.value = true
}

function closeForm(): void {
  formOpen.value = false
  editingCourse.value = null
}

async function confirmDelete(): Promise<void> {
  const course = deletingCourse.value
  if (!course) {
    return
  }
  deleting.value = true
  const ok = await coursesStore.removeCourse(course.id)
  deleting.value = false
  if (ok) {
    deletingCourse.value = null
    toast.push('success', 'Course deleted')
  }
}

function handleSaved(): void {
  toast.push('success', editingCourse.value ? 'Course updated' : 'Course created')
}

function formattedDate(date: string | null): string {
  return date ? format(new Date(`${date}T00:00:00`), 'MMM d, yyyy') : ''
}
</script>

<template>
  <div>
    <PageHeader title="Courses" description="Manage your courses, colors, and target dates.">
      <BaseButton size="sm" @click="openCreate">
        <Plus :size="16" />
        New course
      </BaseButton>
    </PageHeader>

    <ErrorBanner
      v-if="coursesStore.error"
      :message="coursesStore.error"
      @dismiss="coursesStore.error = ''"
    />

    <div v-if="coursesStore.loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading courses">
      <div v-for="i in 6" :key="i" class="h-44 animate-pulse rounded-xl border border-border bg-surface" />
    </div>

    <div
      v-else-if="coursesStore.courses.length === 0"
      class="rounded-xl border border-border bg-surface shadow-card"
    >
      <EmptyState
        :icon="BookOpen"
        title="No courses yet"
        description="Create your first course to start organizing tasks, notes, goals, and study sessions around it."
      >
        <BaseButton size="sm" @click="openCreate">
          <Plus :size="16" />
          Create your first course
        </BaseButton>
      </EmptyState>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <BaseCard
        v-for="course in visibleCourses"
        :key="course.id"
        as="article"
        padding="none"
        class="group flex flex-col overflow-hidden"
      >
        <div class="h-1.5" :style="{ backgroundColor: course.color }" />
        <div class="flex flex-1 flex-col p-5">
          <div class="flex items-start justify-between gap-2">
            <RouterLink
              :to="{ name: 'course-detail', params: { id: course.id } }"
              class="font-semibold text-primary hover:underline"
            >
              {{ course.title }}
            </RouterLink>
            <BaseBadge :tone="course.status === 'active' ? 'soft' : course.status === 'completed' ? 'accent' : 'neutral'">
              {{ statusLabels[course.status] }}
            </BaseBadge>
          </div>
          <p v-if="course.description" class="mt-1.5 line-clamp-2 text-sm text-secondary">
            {{ course.description }}
          </p>
          <div class="mt-auto flex items-center justify-between pt-4">
            <span v-if="course.targetDate" class="text-xs text-muted">
              Target: {{ formattedDate(course.targetDate) }}
            </span>
            <span v-else />
            <div class="flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              <button
                class="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-primary"
                :aria-label="`Edit ${course.title}`"
                @click="openEdit(course)"
              >
                <Pencil :size="16" />
              </button>
              <button
                class="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                :aria-label="`Delete ${course.title}`"
                @click="deletingCourse = course"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <CourseFormModal :open="formOpen" :course="editingCourse" @saved="handleSaved" @close="closeForm" />

    <BaseConfirmDialog
      v-if="deletingCourse"
      title="Delete course?"
      :message="`Delete “${deletingCourse.title}” and remove it from StudyNest? Its tasks, notes, goals, and study sessions will keep existing but no longer link to this course.`"
      :busy="deleting"
      @close="deletingCourse = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
