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
    class="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2648]/60 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-[#faf7fd] shadow-2xl dark:bg-[#2c2648]"
      :class="width"
    >
      <div
        class="flex items-center justify-between border-b border-[#e7ddf3] px-5 py-4 dark:border-[#4b4270]"
      >
        <h3 class="text-lg font-bold">{{ title }}</h3>
        <button
          class="rounded-full p-1 hover:bg-[#eee6f8] dark:hover:bg-[#3c3459]"
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
        class="flex justify-end gap-2 border-t border-[#e7ddf3] px-5 py-3 dark:border-[#4b4270]"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
