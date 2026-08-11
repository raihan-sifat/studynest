<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Settings,
  StickyNote,
  Sun,
  Target,
  Timer,
} from '@lucide/vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const theme = useThemeStore()
const auth = useAuthStore()

const mobileNavOpen = ref(false)

const navItems = [
  { to: { name: 'dashboard' }, label: 'Dashboard', icon: LayoutDashboard },
  { to: { name: 'courses' }, label: 'Courses', icon: BookOpen },
  { to: { name: 'tasks' }, label: 'Tasks', icon: ListTodo },
  { to: { name: 'notes' }, label: 'Notes', icon: StickyNote },
  { to: { name: 'sessions' }, label: 'Sessions', icon: Timer },
  { to: { name: 'goals' }, label: 'Goals', icon: Target },
  { to: { name: 'calendar' }, label: 'Calendar', icon: CalendarDays },
  { to: { name: 'analytics' }, label: 'Analytics', icon: BarChart3 },
]

const currentTitle = computed(() => {
  const item = navItems.find((item) => item.to.name === route.name)
  return item?.label ?? 'Settings'
})

const isActive = (name: unknown) => route.name === name

async function handleLogout(): Promise<void> {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <aside
      class="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface lg:flex"
    >
      <RouterLink
        to="/app"
        class="flex h-16 items-center gap-2 border-b border-border px-5 text-lg font-bold text-primary"
      >
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          S
        </span>
        StudyNest
      </RouterLink>

      <nav class="flex-1 space-y-1 overflow-y-auto p-3">
        <RouterLink
          v-for="item in navItems"
          :key="String(item.to.name)"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="
            isActive(item.to.name)
              ? 'bg-accent-soft text-accent'
              : 'text-secondary hover:bg-background hover:text-primary'
          "
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </RouterLink>

        <RouterLink
          to="/app/settings"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="
            isActive('settings')
              ? 'bg-accent-soft text-accent'
              : 'text-secondary hover:bg-background hover:text-primary'
          "
        >
          <Settings :size="18" />
          Settings
        </RouterLink>
      </nav>

      <div class="border-t border-border p-3">
        <button
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-background hover:text-primary"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          Sign out
        </button>
      </div>
    </aside>

    <div class="lg:pl-60">
      <header
        class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:px-8"
      >
        <h1 class="text-lg font-semibold text-primary">{{ currentTitle }}</h1>

        <div class="flex items-center gap-2">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface hover:text-primary"
            :aria-label="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="theme.toggle"
          >
            <Sun v-if="theme.isDark" :size="18" />
            <Moon v-else :size="18" />
          </button>

          <div
            class="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
          >
            {{ auth.user?.email?.charAt(0).toUpperCase() ?? '?' }}
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-6 lg:px-8">
        <RouterView />
      </main>
    </div>

    <nav
      class="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-surface px-2 pb-safe lg:hidden"
      aria-label="Primary"
    >
      <RouterLink
        v-for="item in navItems.slice(0, 5)"
        :key="String(item.to.name)"
        :to="item.to"
        class="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium"
        :class="isActive(item.to.name) ? 'text-accent' : 'text-muted'"
      >
        <component :is="item.icon" :size="20" />
        {{ item.label }}
      </RouterLink>
      <button
        class="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted"
        aria-label="Open menu"
        @click="mobileNavOpen = !mobileNavOpen"
      >
        <MenuIcon :size="20" />
        More
      </button>
    </nav>

    <div
      v-if="mobileNavOpen"
      class="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      @click="mobileNavOpen = false"
    >
      <div class="absolute inset-0 bg-black/40" />
      <div class="absolute bottom-14 left-0 right-0 mx-4 rounded-xl border border-border bg-surface p-2 shadow-card">
        <RouterLink
          v-for="item in navItems.slice(5)"
          :key="String(item.to.name)"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-background hover:text-primary"
          @click="mobileNavOpen = false"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </RouterLink>
        <RouterLink
          to="/app/settings"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-background hover:text-primary"
          @click="mobileNavOpen = false"
        >
          <Settings :size="18" />
          Settings
        </RouterLink>
        <button
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-background hover:text-primary"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>
