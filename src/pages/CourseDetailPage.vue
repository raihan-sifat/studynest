<script setup lang="ts">
import { useRoute } from 'vue-router'
import { BookOpen } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const courseId = String(route.params.id ?? '')
</script>

<template>
  <div>
    <PageHeader :title="`Course ${courseId}`" description="Course detail, tasks, notes, and goals." />
    <BaseCard>
      <EmptyState
        :icon="BookOpen"
        title="Course detail coming in Milestone 4"
        description="This page will show the course summary plus its related tasks, notes, goals, and study sessions."
      />
    </BaseCard>
  </div>
</template>
