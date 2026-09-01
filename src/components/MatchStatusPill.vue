<script setup>
import { computed } from 'vue'
import PillTag from '@/components/PillTag.vue'
import { STATUS_LABELS } from '@/stores/tournament'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  tint: {
    type: String,
    default: '',
  },
})

const color = computed(() => {
  const map = {
    pending: 'info',
    complete: 'success',
    forfeit: 'warning',
    overdue: 'danger',
    locked: 'light',
    walkover: 'warning',
  }
  return map[props.status] || 'light'
})

const label = computed(() => STATUS_LABELS[props.status] || '待定')
</script>

<template>
  <PillTag :label="label" :color="color" small :outline="!tint" :extra-class="tint" />
</template>
