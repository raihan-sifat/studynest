<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Flag, ListTodo, Timer } from '@lucide/vue'
import { startOfMonth } from 'date-fns'
import type { Course } from '@/types'
import {
  WEEKDAY_LABELS,
  dayKey,
  formatMonthTitle,
  isCurrentDay,
  isCurrentMonth,
  monthGrid,
  totalEventCount,
  type DayEvents,
} from '@/utils/calendar'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  eventsByDay: Map<string, DayEvents>
  selectedDay: string | null
  coursesById: Map<string, Course>
}>()

const emit = defineEmits<{
  select: [dayKey: string]
}>()

const monthStart = ref(startOfMonth(new Date()))

const cells = computed(() => monthGrid(monthStart.value))

const MAX_TASKS = 2
const MAX_SESSIONS = 1
const MAX_GOALS = 1

function eventsFor(day: Date): DayEvents | null {
  return props.eventsByDay.get(dayKey(day)) ?? null
}

function courseColor(courseId: string | null): string {
  return courseId ? props.coursesById.get(courseId)?.color ?? '' : ''
}

function shownCount(events: DayEvents): number {
  return (
    Math.min(events.tasks.length, MAX_TASKS) +
    Math.min(events.sessions.length, MAX_SESSIONS) +
    Math.min(events.goals.length, MAX_GOALS)
  )
}

function hasEvents(day: Date): boolean {
  return totalEventCount(eventsFor(day)) > 0
}

function selectDay(day: Date): void {
  emit('select', dayKey(day))
}

function prevMonth(): void {
  monthStart.value = new Date(monthStart.value.getFullYear(), monthStart.value.getMonth() - 1, 1)
}

function nextMonth(): void {
  monthStart.value = new Date(monthStart.value.getFullYear(), monthStart.value.getMonth() + 1, 1)
}

function goToToday(): void {
  monthStart.value = startOfMonth(new Date())
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-lg font-semibold text-primary">{{ formatMonthTitle(monthStart) }}</h3>
      <div class="flex items-center gap-2">
        <button
          class="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-background hover:text-primary"
          aria-label="Previous month"
          @click="prevMonth"
        >
          <ChevronLeft :size="18" />
        </button>
        <BaseButton size="sm" variant="secondary" @click="goToToday">Today</BaseButton>
        <button
          class="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-background hover:text-primary"
          aria-label="Next month"
          @click="nextMonth"
        >
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-7 gap-1">
      <div
        v-for="label in WEEKDAY_LABELS"
        :key="label"
        class="py-1 text-center text-xs font-medium text-secondary"
      >
        {{ label }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="day in cells"
        :key="dayKey(day)"
        type="button"
        class="focus-ring relative flex min-h-16 flex-col gap-1 rounded-lg border p-1 text-left transition-colors sm:min-h-24"
        :class="[
          dayKey(day) === selectedDay ? 'border-accent bg-accent-soft/50' : 'border-transparent hover:border-border hover:bg-background',
          isCurrentMonth(day, monthStart) ? '' : 'opacity-40',
        ]"
        :aria-label="formatMonthTitle(day)"
        :aria-pressed="dayKey(day) === selectedDay"
        @click="selectDay(day)"
      >
        <span
          class="flex h-6 w-6 items-center justify-center rounded-full text-xs"
          :class="isCurrentDay(day) ? 'bg-accent font-semibold text-on-accent' : 'text-secondary'"
        >
          {{ day.getDate() }}
        </span>

        <span v-if="hasEvents(day)" class="flex gap-0.5 sm:hidden" aria-hidden="true">
          <span v-if="eventsFor(day)!.tasks.length" class="h-1.5 w-1.5 rounded-full bg-primary" />
          <span v-if="eventsFor(day)!.sessions.length" class="h-1.5 w-1.5 rounded-full bg-accent" />
          <span v-if="eventsFor(day)!.goals.length" class="h-1.5 w-1.5 rounded-full bg-warning" />
        </span>

        <span v-if="hasEvents(day)" class="hidden min-w-0 flex-col gap-0.5 sm:flex">
          <span
            v-for="task in eventsFor(day)!.tasks.slice(0, MAX_TASKS)"
            :key="task.id"
            class="flex min-w-0 items-center gap-1 truncate rounded bg-background px-1 py-0.5 text-[10px] text-secondary"
          >
            <span
              class="h-1.5 w-1.5 shrink-0 rounded-full"
              :style="{ backgroundColor: courseColor(task.courseId) || 'var(--color-muted)' }"
            />
            <span class="truncate">{{ task.title }}</span>
          </span>
          <span
            v-for="session in eventsFor(day)!.sessions.slice(0, MAX_SESSIONS)"
            :key="session.id"
            class="flex min-w-0 items-center gap-1 truncate rounded bg-accent-soft px-1 py-0.5 text-[10px] text-accent"
          >
            <Timer :size="10" class="shrink-0" />
            <span class="truncate">Study session</span>
          </span>
          <span
            v-for="goal in eventsFor(day)!.goals.slice(0, MAX_GOALS)"
            :key="goal.id"
            class="flex min-w-0 items-center gap-1 truncate rounded bg-warning/15 px-1 py-0.5 text-[10px] text-warning"
          >
            <Flag :size="10" class="shrink-0" />
            <span class="truncate">{{ goal.title }}</span>
          </span>
          <span
            v-if="totalEventCount(eventsFor(day)) > shownCount(eventsFor(day)!)"
            class="text-[10px] text-muted"
          >
            +{{ totalEventCount(eventsFor(day)) - shownCount(eventsFor(day)!) }} more
          </span>
        </span>
      </button>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-secondary">
      <span class="inline-flex items-center gap-1.5">
        <ListTodo :size="13" class="text-primary" />
        Tasks due
      </span>
      <span class="inline-flex items-center gap-1.5">
        <Timer :size="13" class="text-accent" />
        Study sessions
      </span>
      <span class="inline-flex items-center gap-1.5">
        <Flag :size="13" class="text-warning" />
        Goal deadlines
      </span>
    </div>
  </div>
</template>
