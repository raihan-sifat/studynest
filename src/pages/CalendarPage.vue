<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Calendar" description="Assignments, study sessions, and goal deadlines." />
    <BaseCard>
      <EmptyState
        :icon="CalendarDays"
        title="Calendar coming soon"
        description="A simple monthly calendar will show assignments, study sessions, and goal deadlines."
      />
    </BaseCard>
  </div>
</template>
