<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import StartupSplash from '@/components/ui/StartupSplash.vue'

const showSplash = ref(true)
</script>

<template>
  <StartupSplash v-if="showSplash" @done="showSplash = false" />
  <RouterView />
</template>