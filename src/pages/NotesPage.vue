<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { Languages, Pencil, Plus, Search, StickyNote, Trash2 } from '@lucide/vue'
import { useNotesStore } from '@/stores/notes'
import { useCoursesStore } from '@/stores/courses'
import { useToastStore } from '@/stores/toast'
import type { Note } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import NoteFormModal from '@/components/notes/NoteFormModal.vue'

const notesStore = useNotesStore()
const coursesStore = useCoursesStore()
const toast = useToastStore()

const formOpen = ref(false)
const editingNote = ref<Note | null>(null)
const deletingNote = ref<Note | null>(null)
const deleting = ref(false)

const courseOptions = computed(() => [
  { value: 'all', label: 'All courses' },
  ...coursesStore.courses.map((course) => ({ value: course.id, label: course.title })),
])

const tagOptions = computed(() => [
  { value: '', label: 'All tags' },
  ...notesStore.allTags.map((tag) => ({ value: tag, label: `#${tag}` })),
])

const courseTitle = (courseId: string | null) =>
  courseId ? coursesStore.byId.get(courseId)?.title ?? 'Unknown course' : ''

const courseColor = (courseId: string | null) => coursesStore.byId.get(courseId ?? '')?.color ?? ''

const hasAnyContent = (note: Note) =>
  Boolean(note.englishContent) || Boolean(note.chineseContent)

onMounted(async () => {
  await Promise.all([notesStore.fetchNotes(), coursesStore.fetchCourses()])
})

function openCreate(): void {
  editingNote.value = null
  formOpen.value = true
}

function openEdit(note: Note): void {
  editingNote.value = note
  formOpen.value = true
}

function closeForm(): void {
  formOpen.value = false
  editingNote.value = null
}

async function confirmDelete(): Promise<void> {
  const note = deletingNote.value
  if (!note) {
    return
  }
  deleting.value = true
  const ok = await notesStore.removeNote(note.id)
  deleting.value = false
  if (ok) {
    deletingNote.value = null
    toast.push('success', 'Note deleted')
  }
}

function handleSaved(): void {
  toast.push('success', editingNote.value ? 'Note updated' : 'Note created')
}

function formattedDate(date: string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

function clearFilters(): void {
  notesStore.setFilters({ courseId: 'all', tag: '', search: '' })
}
</script>

<template>
  <div>
    <PageHeader title="Notes" description="Bilingual English and Chinese study notes.">
      <BaseButton size="sm" @click="openCreate">
        <Plus :size="16" />
        New note
      </BaseButton>
    </PageHeader>

    <ErrorBanner
      v-if="notesStore.error"
      :message="notesStore.error"
      @dismiss="notesStore.error = ''"
    />

    <div class="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-card sm:flex-row sm:items-end">
      <div class="flex-1">
        <BaseInput
          v-model="notesStore.filters.search"
          label="Search"
          placeholder="Search notes…"
        />
      </div>
      <div class="grid grid-cols-2 gap-3 sm:flex">
        <BaseSelect v-model="notesStore.filters.courseId" label="Course" :options="courseOptions" />
        <BaseSelect v-model="notesStore.filters.tag" label="Tag" :options="tagOptions" />
      </div>
    </div>

    <div v-if="notesStore.loading" class="grid gap-4 sm:grid-cols-2" aria-label="Loading notes">
      <div v-for="i in 4" :key="i" class="h-40 animate-pulse rounded-xl border border-border bg-surface" />
    </div>

    <div
      v-else-if="notesStore.notes.length === 0"
      class="rounded-xl border border-border bg-surface shadow-card"
    >
      <EmptyState
        :icon="StickyNote"
        title="No notes yet"
        description="Write your first bilingual note — English and Chinese side by side."
      >
        <BaseButton size="sm" @click="openCreate">
          <Plus :size="16" />
          Create your first note
        </BaseButton>
      </EmptyState>
    </div>

    <div v-else-if="notesStore.filteredNotes.length === 0" class="rounded-xl border border-border bg-surface shadow-card">
      <EmptyState
        :icon="Search"
        title="No matching notes"
        description="Try adjusting your search, tag, or course filters."
      >
        <BaseButton size="sm" variant="secondary" @click="clearFilters">Clear filters</BaseButton>
      </EmptyState>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <BaseCard
        v-for="note in notesStore.filteredNotes"
        :key="note.id"
        as="article"
        class="group flex flex-col"
      >
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-semibold text-primary">{{ note.title }}</h3>
          <div class="flex shrink-0 gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <button
              class="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-primary"
              :aria-label="`Edit ${note.title}`"
              @click="openEdit(note)"
            >
              <Pencil :size="16" />
            </button>
            <button
              class="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              :aria-label="`Delete ${note.title}`"
              @click="deletingNote = note"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <div v-if="hasAnyContent(note)" class="mt-3 flex-1 space-y-2">
          <p v-if="note.englishContent" class="line-clamp-3 text-sm text-secondary">
            {{ note.englishContent }}
          </p>
          <p
            v-if="note.chineseContent"
            class="line-clamp-3 border-l-2 border-accent-soft pl-3 text-sm text-secondary"
          >
            {{ note.chineseContent }}
          </p>
        </div>
        <p v-else class="mt-1 flex-1 text-sm text-muted">No content yet.</p>

        <div class="mt-4 flex flex-wrap items-center gap-2 pt-3">
          <span
            v-for="tag in note.tags"
            :key="tag"
            class="inline-flex items-center rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent"
          >
            #{{ tag }}
          </span>
          <span v-if="note.courseId" class="inline-flex items-center gap-1.5 text-xs text-secondary">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: courseColor(note.courseId) }" />
            {{ courseTitle(note.courseId) }}
          </span>
          <span class="ml-auto inline-flex items-center gap-1 text-xs text-muted">
            <Languages v-if="note.englishContent && note.chineseContent" :size="13" />
            {{ formattedDate(note.createdAt) }}
          </span>
        </div>
      </BaseCard>
    </div>

    <NoteFormModal :open="formOpen" :note="editingNote" @saved="handleSaved" @close="closeForm" />

    <BaseConfirmDialog
      v-if="deletingNote"
      title="Delete note?"
      :message="`Delete “${deletingNote.title}”? This cannot be undone.`"
      :busy="deleting"
      @close="deletingNote = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
