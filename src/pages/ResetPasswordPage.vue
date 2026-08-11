<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const auth = useAuthStore()

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

const ready = ref(false)
const password = ref('')
const confirmPassword = ref('')
const fieldErrors = ref<{ password?: string; confirmPassword?: string }>({})
const formError = ref('')
const submitted = ref(false)
const submitting = ref(false)

watchEffect(async () => {
  await auth.init()
  ready.value = true
})

async function submit(): Promise<void> {
  const result = passwordSchema.safeParse({ password: password.value, confirmPassword: confirmPassword.value })
  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors as {
      password?: string
      confirmPassword?: string
    }
    return
  }
  fieldErrors.value = {}
  formError.value = ''
  submitting.value = true
  try {
    await auth.updatePassword(password.value)
    submitted.value = true
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : 'Unable to update password. Try using a fresh reset link.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <template v-if="ready">
      <template v-if="auth.isAuthenticated && !submitted">
        <h1 class="text-xl font-semibold text-primary">Choose a new password</h1>
        <p class="mt-1 text-sm text-secondary">Make it at least 8 characters long.</p>

        <form class="mt-6 flex flex-col gap-4" novalidate @submit.prevent="submit">
          <BaseInput
            v-model="password"
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            autocomplete="new-password"
            :error="fieldErrors.password"
          />
          <BaseInput
            v-model="confirmPassword"
            label="Confirm new password"
            type="password"
            placeholder="Repeat your password"
            autocomplete="new-password"
            :error="fieldErrors.confirmPassword"
          />

          <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {{ formError }}
          </p>

          <BaseButton type="submit" :disabled="submitting">
            {{ submitting ? 'Updating…' : 'Update password' }}
          </BaseButton>
        </form>
      </template>

      <template v-else-if="submitted">
        <h1 class="text-xl font-semibold text-primary">Password updated</h1>
        <p class="mt-2 text-sm text-secondary">Your password has been changed successfully.</p>
        <div class="mt-6">
          <BaseButton class="w-full" @click="router.push({ name: 'login' })">Log in</BaseButton>
        </div>
      </template>

      <template v-else>
        <h1 class="text-xl font-semibold text-primary">Link invalid or expired</h1>
        <p class="mt-2 text-sm text-secondary">
          This password reset link is invalid or has expired. Request a new one and try again.
        </p>
        <div class="mt-6 flex gap-2">
          <BaseButton variant="secondary" class="flex-1" @click="router.push({ name: 'forgot-password' })">
            Request a new link
          </BaseButton>
        </div>
      </template>
    </template>
  </div>
</template>
