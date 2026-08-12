import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Course, CourseStatus } from '@/types'
import {
  createCourse as createCourseRequest,
  deleteCourse as deleteCourseRequest,
  getCourse as getCourseRequest,
  listCourses as listCoursesRequest,
  updateCourse as updateCourseRequest,
  type CourseInput,
} from '@/services/courses'

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref<Course[]>([])
  const loading = ref(false)
  const error = ref('')
  let fetched = false

  const byId = computed(() => {
    const map = new Map<string, Course>()
    for (const course of courses.value) {
      map.set(course.id, course)
    }
    return map
  })

  async function fetchCourses(force = false): Promise<void> {
    if (fetched && !force) {
      return
    }
    loading.value = true
    error.value = ''
    try {
      courses.value = await listCoursesRequest()
      fetched = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load courses'
    } finally {
      loading.value = false
    }
  }

  async function fetchCourse(id: string): Promise<Course | null> {
    try {
      return await getCourseRequest(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load course'
      return null
    }
  }

  async function createCourse(input: CourseInput): Promise<Course | null> {
    error.value = ''
    try {
      const course = await createCourseRequest(input)
      courses.value = [course, ...courses.value]
      return course
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to create course'
      return null
    }
  }

  async function updateCourse(id: string, input: CourseInput): Promise<Course | null> {
    error.value = ''
    try {
      const updated = await updateCourseRequest(id, input)
      courses.value = courses.value.map((course) => (course.id === id ? updated : course))
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to update course'
      return null
    }
  }

  async function removeCourse(id: string): Promise<boolean> {
    error.value = ''
    try {
      await deleteCourseRequest(id)
      courses.value = courses.value.filter((course) => course.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to delete course'
      return false
    }
  }

  function statuses(): CourseStatus[] {
    return ['active', 'completed', 'archived']
  }

  return {
    courses,
    loading,
    error,
    byId,
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    removeCourse,
    statuses,
  }
})
