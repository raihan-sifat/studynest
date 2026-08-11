<script setup lang="ts">
import { Settings } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Settings" description="Profile, preferences, and account management." />
    <BaseCard>
      <EmptyState
        :icon="Settings"
        title="Settings coming in Milestone 2"
        description="Profile management, theme preferences, and account settings will live here."
      />
    </BaseCard>
  </div>
</template>
