<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useThemeStore } from '@/stores/theme'
import { cssVar, hexToRgba } from '@/utils/chartColors'

Chart.register(...registerables)

const props = withDefaults(
  defineProps<{
    value: number
    caption: string
    segments?: number
  }>(),
  {
    segments: 20,
  },
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const theme = useThemeStore()
let chart: Chart<'doughnut'> | null = null

const clamped = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))

function build(): void {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }
  if (chart) {
    chart.destroy()
  }
  const accent = cssVar('--color-accent')
  const surface = cssVar('--color-surface')
  const filled = Math.round((clamped.value / 100) * props.segments)
  chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [
        {
          data: Array.from({ length: props.segments }, () => 1),
          backgroundColor: Array.from({ length: props.segments }, (_, index) =>
            index < filled ? accent : hexToRgba(cssVar('--color-muted'), 0.25),
          ),
          borderColor: surface,
          borderWidth: 2,
          borderRadius: 3,
          spacing: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 180,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  })
}

onMounted(build)
watch(clamped, build)
watch(() => theme.isDark, build)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="relative h-44">
    <canvas ref="canvasRef" :aria-label="`${value}% ${caption}`" role="img" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
      <span class="text-3xl font-bold tabular-nums text-primary">{{ clamped }}%</span>
      <span class="mt-0.5 text-xs text-muted">{{ caption }}</span>
    </div>
  </div>
</template>
