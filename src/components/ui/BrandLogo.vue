<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 28 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="studynest-mark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7C3AED" />
        <stop offset="1" stop-color="#047857" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#studynest-mark)" />
    <ellipse cx="16" cy="11" rx="3.8" ry="5.1" fill="#fff" transform="rotate(-10 16 11)" />
    <path d="M6 18q5-2.5 10-2.5t10 2.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" />
    <path
      d="M4.5 22q5.7-2.4 11.5-2.4T27.5 22"
      stroke="#fff"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.65"
    />
    <path
      d="M6.9 18.6-1.2-2.6 2.3.9M25.1 18.6l1.2-2.6-2.3.9"
      stroke="#fff"
      stroke-width="1.5"
      stroke-linecap="round"
      opacity="0.8"
    />
  </svg>
</template>