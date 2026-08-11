<script setup lang="ts">
import { ListTodo } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Tasks" description="Assignments with status, priority, and deadlines." />
    <BaseCard>
      <EmptyState
        :icon="ListTodo"
        title="No tasks yet"
        description="Milestone 5 adds task CRUD, status, priority, due dates, estimated time, search, filtering, and sorting."
      />
    </BaseCard>
  </div>
</template>
