import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Note } from '@/types'
import {
  createNote as createNoteRequest,
  deleteNote as deleteNoteRequest,
  listNotes as listNotesRequest,
  updateNote as updateNoteRequest,
  type NoteFilters,
  type NoteInput,
} from '@/services/notes'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref('')
  const filters = ref<NoteFilters>({ courseId: 'all', tag: '', search: '' })
  let fetched = false

  const filteredNotes = computed(() =>
    notes.value.filter((note) => {
      if (filters.value.courseId && filters.value.courseId !== 'all' && note.courseId !== filters.value.courseId) {
        return false
      }
      if (filters.value.tag && !note.tags.includes(filters.value.tag)) {
        return false
      }
      if (filters.value.search) {
        const needle = filters.value.search.toLowerCase()
        const haystack = `${note.title} ${note.englishContent ?? ''} ${note.chineseContent ?? ''}`.toLowerCase()
        if (!haystack.includes(needle)) {
          return false
        }
      }
      return true
    }),
  )

  const allTags = computed(() => {
    const tags = new Set<string>()
    for (const note of notes.value) {
      for (const tag of note.tags) {
        tags.add(tag)
      }
    }
    return [...tags].sort((a, b) => a.localeCompare(b))
  })

  async function fetchNotes(force = false): Promise<void> {
    if (fetched && !force) {
      return
    }
    loading.value = true
    error.value = ''
    try {
      notes.value = await listNotesRequest()
      fetched = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load notes'
    } finally {
      loading.value = false
    }
  }

  async function createNote(input: NoteInput): Promise<Note | null> {
    try {
      const note = await createNoteRequest(input)
      notes.value = [note, ...notes.value]
      return note
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to create note'
      return null
    }
  }

  async function updateNote(id: string, input: NoteInput): Promise<Note | null> {
    try {
      const updated = await updateNoteRequest(id, input)
      notes.value = notes.value.map((note) => (note.id === id ? updated : note))
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to update note'
      return null
    }
  }

  async function removeNote(id: string): Promise<boolean> {
    try {
      await deleteNoteRequest(id)
      notes.value = notes.value.filter((note) => note.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to delete note'
      return false
    }
  }

  function setFilters(partial: Partial<NoteFilters>): void {
    filters.value = { ...filters.value, ...partial }
  }

  return {
    notes,
    loading,
    error,
    filters,
    filteredNotes,
    allTags,
    fetchNotes,
    createNote,
    updateNote,
    removeNote,
    setFilters,
  }
})
