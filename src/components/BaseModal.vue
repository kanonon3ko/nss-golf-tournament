<script setup>
import { mdiClose } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: 'max-w-2xl',
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      :class="width"
    >
      <div
        class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-slate-700"
      >
        <h3 class="text-lg font-bold">{{ title }}</h3>
        <button
          class="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-slate-800"
          type="button"
          @click="emit('close')"
        >
          <BaseIcon :path="mdiClose" size="20" />
        </button>
      </div>
      <div class="overflow-y-auto px-5 py-4">
        <slot />
      </div>
      <div
        v-if="$slots.footer"
        class="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-slate-700"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
