<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuAsideMain, menuAsideBottom } from '@/menuAside.js'
import { useDarkModeStore } from '@/stores/darkMode.js'
import { useAuthStore } from '@/stores/auth.js'
import { useMainStore } from '@/stores/main.js'
import { siteName } from '@/config.js'
import BaseIcon from '@/components/BaseIcon.vue'
import {
  mdiMenu,
  mdiClose,
  mdiThemeLightDark,
  mdiLogout,
  mdiEye,
  mdiTrophy,
} from '@mdi/js'

const route = useRoute()
const router = useRouter()
const darkModeStore = useDarkModeStore()
const authStore = useAuthStore()
const mainStore = useMainStore()

const sidebarOpen = ref(false)

function go(item) {
  if (item.to) {
    router.push(item.to)
  }
  if (item.isToggleLightDark) {
    darkModeStore.set(null, true)
  }
  if (item.isLogout) {
    authStore.logout()
    router.push('/')
  }
  sidebarOpen.value = false
}

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-800 dark:text-slate-100">
    <!-- 顶栏 -->
    <header
      class="fixed inset-x-0 top-0 z-40 h-14 border-b border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="flex h-14 items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-md p-1 hover:bg-gray-100 lg:hidden dark:hover:bg-slate-700"
            @click="sidebarOpen = !sidebarOpen"
          >
            <BaseIcon :path="sidebarOpen ? mdiClose : mdiMenu" size="24" />
          </button>
          <span class="flex items-center gap-2 font-bold">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-tr from-emerald-800 via-emerald-900 to-slate-900 text-[#c9a24b]"
            >
              <BaseIcon :path="mdiTrophy" size="18" />
            </span>
            <span>{{ siteName }} · 管理后台</span>
          </span>
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
            :title="darkModeStore.isEnabled ? '切换到浅色模式' : '切换到深色模式'"
            @click="darkModeStore.set(null, true)"
          >
            <BaseIcon :path="mdiThemeLightDark" size="20" />
          </button>
          <RouterLink
            to="/"
            class="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <BaseIcon :path="mdiEye" size="18" />
            <span class="hidden sm:inline">查看前台</span>
          </RouterLink>
          <div
            class="flex items-center gap-2 rounded-full bg-gray-100 py-1 pl-1 pr-3 dark:bg-slate-800"
          >
            <img
              :src="mainStore.userAvatar"
              :alt="mainStore.userName"
              class="h-7 w-7 rounded-full object-cover"
            />
            <span class="text-sm font-semibold">{{ mainStore.userName }}</span>
          </div>
          <button
            type="button"
            class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
            title="退出登录"
            @click="logout"
          >
            <BaseIcon :path="mdiLogout" size="20" />
          </button>
        </div>
      </div>
    </header>

    <!-- 侧边栏 -->
    <aside
      class="fixed inset-y-0 left-0 z-30 w-60 bg-white pt-14 shadow-lg transition-transform lg:translate-x-0 dark:bg-slate-900"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <nav class="flex h-full flex-col overflow-y-auto p-3">
        <RouterLink
          v-for="item in menuAsideMain"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
          :class="
            route.path === item.to
              ? 'bg-emerald-500 font-semibold text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
          "
          @click="sidebarOpen = false"
        >
          <BaseIcon :path="item.icon" size="20" />
          {{ item.label }}
        </RouterLink>
        <div
          class="mt-auto space-y-1 border-t border-gray-200 pt-3 dark:border-slate-700"
        >
          <button
            v-for="item in menuAsideBottom"
            :key="item.label"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="go(item)"
          >
            <BaseIcon :path="item.icon" size="20" />
            {{ item.label }}
          </button>
        </div>
      </nav>
    </aside>

    <!-- 移动端遮罩 -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- 内容 -->
    <div class="pt-14 lg:pl-60">
      <RouterView />
    </div>

    <footer
      class="border-t border-gray-200 py-4 text-center text-xs text-gray-400 lg:pl-60 dark:border-slate-700 dark:text-slate-500"
    >
      © 2026 {{ siteName }} · 基于 Admin One Tailwind Vue 3（MIT）构建
    </footer>
  </div>
</template>
