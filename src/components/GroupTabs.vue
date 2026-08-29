<script setup>
import { GROUPS } from '@/stores/tournament'

defineProps({
  modelValue: {
    type: String,
    default: 'A',
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="g in GROUPS"
      :key="g"
      type="button"
      class="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
      :class="
        modelValue === g
          ? 'bg-emerald-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      "
      @click="emit('update:modelValue', g)"
    >
      {{ g }} 组
    </button>
  </div>
</template>
