<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
import BrandLogo from '@/components/ui/BrandLogo.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

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

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && mobileNavOpen.value) {
    mobileNavOpen.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

async function handleLogout(): Promise<void> {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <a
      href="#main-content"
      class="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary focus:shadow-card"
    >
      Skip to content
    </a>

    <aside
      class="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface lg:flex"
    >
      <RouterLink
        to="/app"
        class="flex h-16 items-center gap-2.5 border-b border-border px-5 text-lg font-bold text-primary"
      >
        <BrandLogo :size="28" />
        StudyNest
      </RouterLink>

      <nav class="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main">
        <RouterLink
          v-for="item in navItems"
          :key="String(item.to.name)"
          :to="item.to"
          class="group focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out"
          :class="
            isActive(item.to.name)
              ? 'bg-brand-soft text-brand'
              : 'text-secondary hover:translate-x-0.5 hover:bg-background hover:text-primary'
          "
          :aria-current="isActive(item.to.name) ? 'page' : undefined"
        >
          <component
            :is="item.icon"
            :size="18"
            class="transition-transform duration-200 ease-out group-hover:scale-110"
          />
          {{ item.label }}
        </RouterLink>

        <RouterLink
          to="/app/settings"
          class="group focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out"
          :class="
            isActive('settings')
              ? 'bg-brand-soft text-brand'
              : 'text-secondary hover:translate-x-0.5 hover:bg-background hover:text-primary'
          "
          :aria-current="isActive('settings') ? 'page' : undefined"
        >
          <Settings
            :size="18"
            class="transition-transform duration-200 ease-out group-hover:scale-110"
          />
          Settings
        </RouterLink>
      </nav>

      <div class="border-t border-border p-3">
        <button
          class="group focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-all duration-200 ease-out hover:translate-x-0.5 hover:bg-background hover:text-primary"
          @click="handleLogout"
        >
          <LogOut
            :size="18"
            class="transition-transform duration-200 ease-out group-hover:scale-110"
          />
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
            class="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface hover:text-primary"
            :aria-label="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="theme.isDark"
            @click="theme.toggle"
          >
            <Sun v-if="theme.isDark" :size="18" />
            <Moon v-else :size="18" />
          </button>

          <div
            class="group relative outline-none"
            role="group"
            aria-label="Profile"
            aria-describedby="profile-popup"
            tabindex="0"
          >
            <img
              v-if="auth.profile?.avatarUrl"
              :src="auth.profile.avatarUrl"
              alt="Your profile avatar"
              class="h-9 w-9 rounded-full bg-surface object-cover ring-1 ring-border"
            />
            <div
              v-else
              class="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent"
            >
              {{ auth.user?.email?.charAt(0).toUpperCase() ?? '?' }}
            </div>

            <div
              id="profile-popup"
              class="pointer-events-none absolute right-0 top-full z-40 mt-2 w-64 translate-y-1 rounded-xl border border-border bg-surface p-3 opacity-0 shadow-card transition-all duration-200 ease-out group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="auth.profile?.avatarUrl"
                  :src="auth.profile.avatarUrl"
                  alt=""
                  class="h-9 w-9 shrink-0 rounded-full bg-surface object-cover ring-1 ring-border"
                />
                <div
                  v-else
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent"
                >
                  {{ auth.user?.email?.charAt(0).toUpperCase() ?? '?' }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-primary">
                    {{ auth.profile?.name?.trim() || 'Your account' }}
                  </p>
                  <p v-if="auth.user?.email" class="truncate text-xs text-secondary">
                    {{ auth.user.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" class="mx-auto max-w-6xl px-4 py-6 lg:px-8">
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
        class="focus-ring flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium"
        :class="isActive(item.to.name) ? 'text-brand' : 'text-muted'"
        :aria-current="isActive(item.to.name) ? 'page' : undefined"
      >
        <component :is="item.icon" :size="20" />
        {{ item.label }}
      </RouterLink>
      <button
        class="focus-ring flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted"
        aria-label="Open menu"
        aria-haspopup="dialog"
        :aria-expanded="mobileNavOpen"
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
      <div class="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        class="absolute bottom-14 left-0 right-0 mx-4 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-card"
      >
        <RouterLink
          v-for="item in navItems.slice(5)"
          :key="String(item.to.name)"
          :to="item.to"
          class="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-background hover:text-primary"
          @click="mobileNavOpen = false"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </RouterLink>
        <RouterLink
          to="/app/settings"
          class="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-background hover:text-primary"
          @click="mobileNavOpen = false"
        >
          <Settings :size="18" />
          Settings
        </RouterLink>
        <button
          class="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-background hover:text-primary"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          Sign out
        </button>
      </div>
    </div>

    <ToastContainer />
  </div>
</template>