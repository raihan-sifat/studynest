<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, registerables, type GridLineOptions } from 'chart.js'
import { useThemeStore } from '@/stores/theme'
import { cssVar, hexToRgba } from '@/utils/chartColors'

Chart.register(...registerables)

const props = defineProps<{
  labels: string[]
  values: number[]
  label?: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const theme = useThemeStore()
let chart: Chart<'bar'> | null = null

function build(): void {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }
  if (chart) {
    chart.destroy()
  }
  const border = cssVar('--color-border')
  chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.label ?? 'Minutes',
          data: props.values,
          backgroundColor: cssVar('--color-accent'),
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 28,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: cssVar('--color-surface'),
          titleColor: cssVar('--color-primary'),
          bodyColor: cssVar('--color-secondary'),
          borderColor: border,
          borderWidth: 1,
          cornerRadius: 10,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} min`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: cssVar('--color-secondary'), font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: {
            color: hexToRgba(border, 0.7),
            borderDash: [4, 4],
          } as Partial<GridLineOptions> & { borderDash?: number[] },
          ticks: { color: cssVar('--color-muted'), font: { size: 11 } },
        },
      },
    },
  })
}

onMounted(build)
watch(() => props.labels, build)
watch(() => props.values, build)
watch(() => theme.isDark, build)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="relative h-64">
    <canvas ref="canvasRef" :aria-label="label" role="img" />
  </div>
</template>
