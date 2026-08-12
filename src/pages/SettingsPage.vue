<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { Check, LogOut } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { isConfigured } from '@/services/supabase'
import { AVATARS } from '@/avatars'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const profileSchema = z.object({
  name: z.string().max(80, 'Name must be under 80 characters'),
  bio: z.string().max(500, 'Bio must be under 500 characters'),
})

const name = ref('')
const bio = ref('')
const avatarUrl = ref('')
const fieldErrors = ref<{ name?: string; bio?: string; avatarUrl?: string }>({})
const formError = ref('')
const saving = ref(false)
const resetError = ref('')

watchEffect(async () => {
  await auth.init()
  if (auth.profile) {
    name.value = auth.profile.name
    bio.value = auth.profile.bio ?? ''
    avatarUrl.value = auth.profile.avatarUrl ?? ''
  }
})

async function saveProfile(): Promise<void> {
  const result = profileSchema.safeParse({ name: name.value, bio: bio.value })
  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors as {
      name?: string
      bio?: string
    }
    return
  }
  fieldErrors.value = {}
  formError.value = ''
  saving.value = true
  try {
    await auth.updateProfile({
      name: name.value,
      bio: bio.value,
      avatarUrl: avatarUrl.value || null,
    })
    toast.push('success', 'Profile saved')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to save profile'
  } finally {
    saving.value = false
  }
}

function selectAvatar(src: string): void {
  avatarUrl.value = src
  fieldErrors.value.avatarUrl = undefined
}

function clearAvatar(): void {
  avatarUrl.value = ''
}

async function sendResetEmail(): Promise<void> {
  const email = auth.user?.email
  if (!email) {
    return
  }
  resetError.value = ''
  try {
    await auth.requestPasswordReset(email)
    toast.push('success', `Password reset link sent to ${email}`)
  } catch (error) {
    resetError.value = error instanceof Error ? error.message : 'Unable to send reset email'
  }
}

async function handleLogout(): Promise<void> {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="Settings" description="Profile, preferences, and account management." />

    <div
      v-if="!isConfigured()"
      class="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-secondary"
      role="status"
    >
      Supabase isn't configured yet. Copy <code class="rounded bg-background px-1.5 py-0.5 text-primary">.env.example</code> to
      <code class="rounded bg-background px-1.5 py-0.5 text-primary">.env</code> and add your
      <code class="rounded bg-background px-1.5 py-0.5 text-primary">VITE_SUPABASE_URL</code> and
      <code class="rounded bg-background px-1.5 py-0.5 text-primary">VITE_SUPABASE_ANON_KEY</code>
      to enable sign in, profile saving, and password resets.
    </div>

    <BaseCard>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-primary">Profile</h3>
        <BaseBadge tone="soft">Profile</BaseBadge>
      </div>
      <p class="mt-1 text-sm text-secondary">
        How you appear across StudyNest. Stored in the <code class="rounded bg-background px-1 text-xs text-primary">profiles</code>
        table (created in Milestone 3).
      </p>

      <form class="mt-5 flex flex-col gap-4" novalidate @submit.prevent="saveProfile">
        <BaseInput
          v-model="name"
          label="Name"
          placeholder="Your name"
          autocomplete="name"
          :error="fieldErrors.name"
        />
        <BaseInput
          v-model="bio"
          label="Bio"
          placeholder="A short line about you"
          :error="fieldErrors.bio"
          hint="Optional — max 500 characters"
        />
        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-primary">Avatar</span>
          <div class="rounded-xl border border-border bg-background p-4">
            <div class="grid grid-cols-4 gap-4">
              <button
                v-for="avatar in AVATARS"
                :key="avatar.id"
                type="button"
                class="focus-ring relative flex items-center justify-center transition-transform hover:scale-105"
                :aria-pressed="avatarUrl === avatar.src"
                :aria-label="`Use the ${avatar.name} avatar`"
                @click="selectAvatar(avatar.src)"
              >
                <img :src="avatar.src" :alt="avatar.name" class="h-12 w-12 sm:h-14 sm:w-14" />
                <span
                  v-if="avatarUrl === avatar.src"
                  class="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent shadow-card"
                >
                  <Check :size="12" stroke-width="3" />
                </span>
              </button>
            </div>
          </div>
          <p class="text-sm text-muted">
            Pick an avatar or paste a custom image link below. It will appear next to your name across the app.
          </p>
        </div>
        <BaseInput
          v-model="avatarUrl"
          label="Custom image URL"
          type="url"
          placeholder="https://example.com/avatar.png"
          :error="fieldErrors.avatarUrl"
          hint="Optional — overrides the picked avatar"
        />

        <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {{ formError }}
        </p>

        <div class="flex justify-end gap-2">
          <BaseButton type="button" variant="secondary" :disabled="saving || auth.loading" @click="clearAvatar">
            Remove avatar
          </BaseButton>
          <BaseButton type="submit" :disabled="saving || auth.loading">
            {{ saving ? 'Saving…' : 'Save profile' }}
          </BaseButton>
        </div>
      </form>
    </BaseCard>

    <BaseCard>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-primary">Account</h3>
        <BaseBadge tone="neutral">Account</BaseBadge>
      </div>
      <p class="mt-1 text-sm text-secondary">
        Signed in as <strong class="text-primary">{{ auth.user?.email }}</strong>.
      </p>

      <div class="mt-5 flex flex-col gap-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-primary">Password</p>
            <p class="text-sm text-secondary">We'll email you a link to set a new password.</p>
          </div>
          <BaseButton variant="secondary" size="sm" @click="sendResetEmail">
            Send reset link
          </BaseButton>
        </div>

        <p v-if="resetError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {{ resetError }}
        </p>
      </div>
    </BaseCard>

    <BaseCard>
      <h3 class="font-semibold text-primary">Sign out</h3>
      <p class="mt-1 text-sm text-secondary">End this session on this device.</p>
      <div class="mt-4">
        <BaseButton variant="secondary" size="sm" @click="handleLogout">
          <LogOut :size="16" />
          Sign out
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>
