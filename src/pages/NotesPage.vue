<script setup lang="ts">
import { StickyNote } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Notes" description="Bilingual English and Chinese study notes." />
    <BaseCard>
      <EmptyState
        :icon="StickyNote"
        title="No notes yet"
        description="Milestone 6 adds bilingual notes with tags, course association, search, filtering, and full CRUD."
      />
    </BaseCard>
  </div>
</template>
