<script setup lang="ts">
import { LineChart } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Analytics" description="Study time, task completion, and course distribution." />
    <BaseCard>
      <EmptyState
        :icon="LineChart"
        title="Analytics coming in Milestone 10"
        description="Charts built from real data: study time, task completion, course distribution, goal progress, weekly activity, and completion rates."
      />
    </BaseCard>
  </div>
</template>
