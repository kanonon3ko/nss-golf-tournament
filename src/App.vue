<script setup>
import { RouterView } from 'vue-router'
import { useTournamentStore } from '@/stores/tournament'
import { useAuthStore } from '@/stores/auth'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiTrophy } from '@mdi/js'

const tournamentStore = useTournamentStore()
const authStore = useAuthStore()

// 数据与登录会话初始化；若已是管理员（会话恢复），把本地数据同步到云端
Promise.all([tournamentStore.init(), authStore.init()]).then(() => {
  if (authStore.isAdmin) {
    tournamentStore.ensureCloudSync()
  }
})
</script>

<template>
  <!-- 数据就绪前显示加载页，避免“未抽签”空状态闪烁 -->
  <div
    v-if="!tournamentStore.ready"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50 dark:bg-slate-800"
  >
    <div class="flex flex-col items-center gap-3">
      <span
        class="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-linear-to-tr from-emerald-800 via-emerald-900 to-slate-900 text-[#c9a24b]"
      >
        <BaseIcon :path="mdiTrophy" size="26" />
      </span>
      <p class="text-sm text-gray-500 dark:text-slate-400">正在加载赛事数据…</p>
    </div>
  </div>
  <RouterView v-else />
</template>
