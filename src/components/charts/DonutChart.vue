<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useThemeStore } from '@/stores/theme'
import { cssVar } from '@/utils/chartColors'

Chart.register(...registerables)

const props = defineProps<{
  labels: string[]
  values: number[]
  colors: string[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const theme = useThemeStore()
let chart: Chart<'doughnut'> | null = null

function build(): void {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }
  if (chart) {
    chart.destroy()
  }
  chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.values,
          backgroundColor: props.colors.map((token) => cssVar(token)),
          borderColor: cssVar('--color-surface'),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: cssVar('--color-surface'),
          titleColor: cssVar('--color-primary'),
          bodyColor: cssVar('--color-secondary'),
          borderColor: cssVar('--color-border'),
          borderWidth: 1,
          cornerRadius: 10,
          padding: 10,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          boxPadding: 4,
        },
      },
    },
  })
}

onMounted(build)
watch(() => props.values, build)
watch(() => props.labels, build)
watch(() => props.colors, build)
watch(() => theme.isDark, build)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="relative h-56">
    <canvas ref="canvasRef" :aria-label="labels.join(', ')" role="img" />
  </div>
</template>
