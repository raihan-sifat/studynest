<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const auth = useAuthStore()

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

const email = ref('')
const emailError = ref('')
const formError = ref('')
const sent = ref(false)
const submitting = ref(false)

async function submit(): Promise<void> {
  const result = emailSchema.safeParse({ email: email.value })
  if (!result.success) {
    emailError.value = result.error.flatten().fieldErrors.email?.[0] ?? ''
    return
  }
  emailError.value = ''
  formError.value = ''
  submitting.value = true
  try {
    await auth.requestPasswordReset(email.value)
    sent.value = true
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to send reset email'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-primary">Reset your password</h1>
    <p class="mt-1 text-sm text-secondary">
      Enter your email and we'll send you a link to set a new password.
    </p>

    <form v-if="!sent" class="mt-6 flex flex-col gap-4" novalidate @submit.prevent="submit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        :error="emailError"
      />

      <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
        {{ formError }}
      </p>

      <BaseButton type="submit" :disabled="submitting">
        {{ submitting ? 'Sending…' : 'Send reset link' }}
      </BaseButton>
    </form>

    <div v-else class="mt-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">
      If an account exists for <strong>{{ email }}</strong>, a password reset link is on its way.
      Check your inbox.
    </div>

    <p class="mt-6 text-center text-sm text-secondary">
      Remembered it?
      <RouterLink to="/login" class="font-medium text-accent hover:underline">Log in</RouterLink>
    </p>
  </div>
</template>
