export type CourseStatus = 'active' | 'completed' | 'archived'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type GoalStatus = 'active' | 'achieved' | 'archived'
export type FocusRating = 1 | 2 | 3 | 4 | 5

export interface Profile {
  id: string
  userId: string
  name: string
  avatarUrl: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: string
  userId: string
  title: string
  description: string | null
  color: string
  targetDate: string | null
  status: CourseStatus
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  userId: string
  courseId: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  estimatedMinutes: number | null
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  userId: string
  courseId: string | null
  title: string
  englishContent: string | null
  chineseContent: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  userId: string
  courseId: string | null
  title: string
  description: string | null
  targetValue: number
  currentValue: number
  deadline: string | null
  status: GoalStatus
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  userId: string
  courseId: string | null
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  focusRating: FocusRating | null
  description: string | null
  createdAt: string
}

export const COURSE_COLORS = [
  '#16A36A',
  '#3572EF',
  '#B05CE6',
  '#E07B39',
  '#E45D5D',
  '#0EA5E9',
] as const
