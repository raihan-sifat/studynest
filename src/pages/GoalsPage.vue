<script setup lang="ts">
import { Target } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Goals" description="Targets, deadlines, and progress." />
    <BaseCard>
      <EmptyState
        :icon="Target"
        title="No goals yet"
        description="Milestone 8 adds goal creation with target/current values, deadlines, progress visualization, and status."
      />
    </BaseCard>
  </div>
</template>
