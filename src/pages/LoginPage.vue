<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const email = ref('')
const password = ref('')
const fieldErrors = ref<{ email?: string; password?: string }>({})
const formError = ref('')
const submitting = ref(false)

async function submit(): Promise<void> {
  const result = loginSchema.safeParse({ email: email.value, password: password.value })
  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors as { email?: string; password?: string }
    return
  }
  fieldErrors.value = {}
  formError.value = ''
  submitting.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/app'
    router.push(redirect)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to log in'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-primary">Welcome back</h1>
    <p class="mt-1 text-sm text-secondary">Log in to continue your study journey.</p>

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
        placeholder="••••••••"
        autocomplete="current-password"
        :error="fieldErrors.password"
      />

      <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
        {{ formError }}
      </p>

      <BaseButton type="submit" :disabled="submitting">
        {{ submitting ? 'Logging in…' : 'Log in' }}
      </BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-secondary">
      New to StudyNest?
      <RouterLink to="/register" class="font-medium text-accent hover:underline">
        Create an account
      </RouterLink>
    </p>
  </div>
</template>
