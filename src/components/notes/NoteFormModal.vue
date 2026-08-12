<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import { X } from '@lucide/vue'
import { useNotesStore } from '@/stores/notes'
import { useCoursesStore } from '@/stores/courses'
import type { Note } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  open: boolean
  note: Note | null
  defaultCourseId?: string | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const notesStore = useNotesStore()
const coursesStore = useCoursesStore()

const noteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300, 'Title must be under 300 characters'),
  englishContent: z.string().max(20000, 'Content is too long'),
  chineseContent: z.string().max(20000, 'Content is too long'),
  courseId: z.string(),
})

const title = ref('')
const englishContent = ref('')
const chineseContent = ref('')
const courseId = ref('none')
const tags = ref<string[]>([])
const tagInput = ref('')
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const saving = ref(false)

const courseOptions = computed(() => {
  const options = coursesStore.courses.map((course) => ({ value: course.id, label: course.title }))
  return [{ value: 'none', label: 'No course' }, ...options]
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      title.value = props.note?.title ?? ''
      englishContent.value = props.note?.englishContent ?? ''
      chineseContent.value = props.note?.chineseContent ?? ''
      courseId.value = props.note?.courseId ?? props.defaultCourseId ?? 'none'
      tags.value = [...(props.note?.tags ?? [])]
      tagInput.value = ''
      fieldErrors.value = {}
      formError.value = ''
    }
  },
)

function addTag(): void {
  const raw = tagInput.value.trim()
  if (!raw) {
    return
  }
  const normalized = raw.replace(/^#/, '').toLowerCase().replace(/\s+/g, '-')
  if (!tags.value.includes(normalized)) {
    tags.value = [...tags.value, normalized]
  }
  tagInput.value = ''
}

function removeTag(tag: string): void {
  tags.value = tags.value.filter((item) => item !== tag)
}

function onTagKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag()
  } else if (event.key === 'Backspace' && tagInput.value === '' && tags.value.length > 0) {
    tags.value = tags.value.slice(0, -1)
  }
}

async function submit(): Promise<void> {
  const result = noteSchema.safeParse({
    title: title.value,
    englishContent: englishContent.value,
    chineseContent: chineseContent.value,
    courseId: courseId.value,
  })
  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors as Record<string, string>
    return
  }
  fieldErrors.value = {}
  formError.value = ''
  saving.value = true
  try {
    const input = {
      title: title.value,
      englishContent: englishContent.value || null,
      chineseContent: chineseContent.value || null,
      tags: tags.value,
      courseId: courseId.value === 'none' ? null : courseId.value,
    }
    const saved =
      props.note === null
        ? await notesStore.createNote(input)
        : await notesStore.updateNote(props.note.id, input)
    if (saved === null) {
      formError.value = notesStore.error || 'Something went wrong'
      return
    }
    emit('saved')
    emit('close')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal
    :title="note === null ? 'New note' : 'Edit note'"
    :open="open"
    @close="emit('close')"
  >
    <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" novalidate @submit.prevent="submit">
      <div class="sm:col-span-2">
        <BaseInput v-model="title" label="Title" placeholder="e.g. Vue reactivity explained" :error="fieldErrors.title" />
      </div>

      <BaseTextarea
        v-model="englishContent"
        label="English content"
        placeholder="Write your notes in English…"
        :rows="5"
        :error="fieldErrors.englishContent"
      />

      <BaseTextarea
        v-model="chineseContent"
        label="Chinese content"
        placeholder="用中文写下笔记…"
        :rows="5"
        :error="fieldErrors.chineseContent"
        hint="Optional — write the same note in Chinese to practice both languages."
      />

      <div class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-primary">Tags</span>
        <div class="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
          <span
            v-for="tag in tags"
            :key="tag"
            class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent"
          >
            #{{ tag }}
            <button type="button" :aria-label="`Remove tag ${tag}`" class="hover:text-primary" @click="removeTag(tag)">
              <X :size="12" />
            </button>
          </span>
          <input
            v-model="tagInput"
            type="text"
            class="h-7 min-w-24 flex-1 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
            placeholder="Type a tag and press Enter"
            aria-label="Add a tag"
            @keydown="onTagKeydown"
          />
        </div>
      </div>

      <BaseSelect v-model="courseId" label="Course" :options="courseOptions" :error="fieldErrors.courseId" />

      <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger sm:col-span-2" role="alert">
        {{ formError }}
      </p>

      <div class="mt-2 flex justify-end gap-2 sm:col-span-2">
        <BaseButton variant="secondary" :disabled="saving" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" :disabled="saving">
          {{ saving ? 'Saving…' : note === null ? 'Create note' : 'Save changes' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
