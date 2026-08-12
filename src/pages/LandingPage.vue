<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BookOpen, CheckSquare, LineChart, StickyNote, Timer } from '@lucide/vue'

const features = [
  {
    icon: BookOpen,
    title: 'Courses & assignments',
    description: 'Organize every course with tasks, deadlines, and priorities in one place.',
  },
  {
    icon: Timer,
    title: 'Study sessions',
    description: 'Track focused study time with a start/pause/resume timer and focus ratings.',
  },
  {
    icon: StickyNote,
    title: 'Bilingual notes',
    description: 'Write notes in English and Chinese side by side, with tags and search.',
  },
  {
    icon: CheckSquare,
    title: 'Goals that stick',
    description: 'Set measurable goals, watch progress, and stay on track toward deadlines.',
  },
  {
    icon: LineChart,
    title: 'Progress analytics',
    description: 'Understand your study habits with charts, weekly activity, and completion rates.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b border-border bg-surface">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div class="flex items-center gap-2 text-lg font-bold text-primary">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-on-accent">
            S
          </span>
          StudyNest
        </div>
        <nav class="flex items-center gap-2">
          <RouterLink
            to="/login"
            class="focus-ring inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-secondary transition-colors hover:bg-background hover:text-primary"
          >
            Log in
          </RouterLink>
          <RouterLink
            to="/register"
            class="focus-ring inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent/90"
          >
            Get started
          </RouterLink>
        </nav>
      </div>
    </header>

    <main>
      <section class="mx-auto max-w-6xl px-4 py-20 text-center lg:py-28">
        <h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-primary lg:text-5xl">
          Organize your learning.
          <span class="text-accent">Track your progress.</span>
          Build better study habits.
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-lg text-secondary">
          StudyNest gives students one focused workspace for courses, assignments, study
          sessions, bilingual notes, learning goals, and progress analytics.
        </p>
        <div class="mt-10 flex items-center justify-center gap-3">
          <RouterLink
            to="/register"
            class="focus-ring inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 text-base font-medium text-on-accent transition-colors hover:bg-accent/90"
          >
            Start studying free
          </RouterLink>
          <RouterLink
            to="/login"
            class="focus-ring inline-flex h-12 items-center justify-center rounded-lg border border-border bg-surface px-6 text-base font-medium text-primary transition-colors hover:bg-background"
          >
            Log in
          </RouterLink>
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 pb-20">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="rounded-xl border border-border bg-surface p-6 shadow-card"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <component :is="feature.icon" :size="20" />
            </div>
            <h3 class="mt-4 font-semibold text-primary">{{ feature.title }}</h3>
            <p class="mt-1.5 text-sm text-secondary">{{ feature.description }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-border py-8 text-center text-sm text-muted">
      StudyNest — Build better study habits.
    </footer>
  </div>
</template>
