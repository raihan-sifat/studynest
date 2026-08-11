<script setup lang="ts">
import { BookOpen } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Courses" description="Manage your courses, colors, and target dates." />
    <BaseCard>
      <EmptyState
        :icon="BookOpen"
        title="No courses yet"
        description="Milestone 4 adds full course CRUD, course lists, and dedicated course detail pages."
      />
    </BaseCard>
  </div>
</template>
