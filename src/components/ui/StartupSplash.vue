<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BrandLogo from '@/components/ui/BrandLogo.vue'

const emit = defineEmits<{ done: [] }>()

const fading = ref(false)

let hideTimer: ReturnType<typeof setTimeout> | undefined
let unmountTimer: ReturnType<typeof setTimeout> | undefined

function startFade(): void {
  fading.value = true
  unmountTimer = setTimeout(() => emit('done'), 450)
}

const DURATION_MS = 1500

onMounted(() => {
  document.body.style.overflow = 'hidden'
  hideTimer = setTimeout(startFade, DURATION_MS)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  if (hideTimer) clearTimeout(hideTimer)
  if (unmountTimer) clearTimeout(unmountTimer)
})
</script>

<template>
  <div
    class="startup-overlay fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 transition-opacity duration-[450ms] ease-out"
    :class="fading ? 'opacity-0' : 'opacity-100'"
    role="status"
    aria-label="StudyNest is loading"
  >
    <div class="startup-tile backdrop-blur-md">
      <BrandLogo :size="72" />
    </div>
    <div class="flex flex-col items-center">
      <h1 class="startup-wordmark text-3xl font-bold tracking-tight text-white">StudyNest</h1>
      <p class="startup-tagline mt-2 text-sm font-medium text-white/75">
        Build better study habits
      </p>
    </div>
  </div>
</template>

<style scoped>
.startup-overlay {
  background:
    radial-gradient(1000px 420px at 50% -10%, rgb(255 255 255 / 0.14), transparent 60%),
    linear-gradient(135deg, #7c3aed 0%, #047857 100%);
}

.startup-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 28px;
  background: rgb(255 255 255 / 0.16);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.3),
    0 24px 48px -12px rgb(0 0 0 / 0.35);
  animation: tile-pop 0.9s cubic-bezier(0.22, 1.2, 0.36, 1) both;
}

.startup-wordmark {
  animation: rise-in 0.6s ease-out 0.35s both;
}

.startup-tagline {
  animation: rise-in 0.6s ease-out 0.5s both;
}

@keyframes tile-pop {
  0% {
    transform: scale(0.55);
    opacity: 0;
  }
  60% {
    transform: scale(1.06);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes rise-in {
  0% {
    transform: translateY(14px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>