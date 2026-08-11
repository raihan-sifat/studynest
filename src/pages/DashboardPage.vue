<script setup lang="ts">
import { LayoutDashboard } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Dashboard" description="Your study overview and today's tasks." />
    <BaseCard>
      <EmptyState
        :icon="LayoutDashboard"
        title="Your dashboard will live here"
        description="Milestone 9 aggregates real data into summary cards, today's tasks, active goals, recent sessions, course progress, and weekly activity."
      />
    </BaseCard>
  </div>
</template>
