<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const auth = useAuthStore()

const registerSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fieldErrors = ref<{ email?: string; password?: string; confirmPassword?: string }>({})
const formError = ref('')
const needsConfirmation = ref(false)
const submitting = ref(false)

async function submit(): Promise<void> {
  const result = registerSchema.safeParse({ email: email.value, password: password.value, confirmPassword: confirmPassword.value })
  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors as {
      email?: string
      password?: string
      confirmPassword?: string
    }
    return
  }
  fieldErrors.value = {}
  formError.value = ''
  submitting.value = true
  try {
    const signedIn = await auth.register(email.value, password.value)
    if (signedIn) {
      router.push({ name: 'dashboard' })
    } else {
      needsConfirmation.value = true
    }
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to create account'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-primary">Create your account</h1>
    <p class="mt-1 text-sm text-secondary">One workspace for all your study activity.</p>

    <form class="mt-6 flex flex-col gap-4" novalidate @submit.prevent="submit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        :error="fieldErrors.email"
      />
      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        autocomplete="new-password"
        :error="fieldErrors.password"
      />
      <BaseInput
        v-model="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="Repeat your password"
        autocomplete="new-password"
        :error="fieldErrors.confirmPassword"
      />

      <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
        {{ formError }}
      </p>

      <div
        v-if="needsConfirmation"
        class="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent"
        role="status"
      >
        Almost there! Check <strong>{{ email }}</strong> and confirm your email address to finish
        creating your account.
      </div>

      <BaseButton type="submit" :disabled="submitting">
        {{ submitting ? 'Creating account…' : 'Create account' }}
      </BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-secondary">
      Already have an account?
      <RouterLink to="/login" class="font-medium text-accent hover:underline">
        Log in
      </RouterLink>
    </p>
  </div>
</template>
