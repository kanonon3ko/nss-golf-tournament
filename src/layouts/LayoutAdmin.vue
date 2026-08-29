<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuAsideMain, menuAsideBottom } from '@/menuAside.js'
import { useDarkModeStore } from '@/stores/darkMode.js'
import { useAuthStore } from '@/stores/auth.js'
import { useMainStore } from '@/stores/main.js'
import { siteName } from '@/config.js'
import BaseIcon from '@/components/BaseIcon.vue'
import GolfLogo from '@/components/GolfLogo.vue'
import {
  mdiMenu,
  mdiClose,
  mdiThemeLightDark,
  mdiLogout,
  mdiEye,
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
  <div class="min-h-screen bg-[#ede2f6] dark:bg-linear-to-br dark:from-[#7d6ba8] dark:to-[#2a2440] dark:text-slate-100">
    <!-- 顶栏 -->
    <header
      class="fixed inset-x-0 top-0 z-40 h-14 border-b border-[#e7ddf3] bg-[#faf7fd] dark:border-[#4b4270] dark:bg-[#2c2648]"
    >
      <div class="flex h-14 items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#eee6f8] lg:hidden dark:hover:bg-[#463e68]"
            @click="sidebarOpen = !sidebarOpen"
          >
            <BaseIcon :path="sidebarOpen ? mdiClose : mdiMenu" size="24" />
          </button>
          <span class="flex items-center gap-2 font-bold">
            <GolfLogo :size="32" />
            <span><span class="hidden sm:inline">{{ siteName }} · </span>主办方后台</span>
          </span>
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#eee6f8] dark:text-slate-300 dark:hover:bg-[#463e68]"
            :title="darkModeStore.isEnabled ? '切换到浅色模式' : '切换到深色模式'"
            @click="darkModeStore.set(null, true)"
          >
            <BaseIcon :path="mdiThemeLightDark" size="20" />
          </button>
          <RouterLink
            to="/"
            class="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-[#eee6f8] dark:text-slate-300 dark:hover:bg-[#463e68]"
          >
            <BaseIcon :path="mdiEye" size="18" />
            <span class="hidden sm:inline">查看前台</span>
          </RouterLink>
          <div
            class="flex items-center gap-2 rounded-full bg-[#eee6f8] py-1 pl-1 pr-1 dark:bg-[#3c3459] sm:pr-3"
          >
            <img
              :src="mainStore.userAvatar"
              :alt="mainStore.userName"
              class="h-7 w-7 rounded-full object-cover"
            />
            <span class="hidden text-sm font-semibold sm:inline">{{ mainStore.userName }}</span>
          </div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#eee6f8] dark:text-slate-300 dark:hover:bg-[#463e68]"
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
      class="fixed inset-y-0 left-0 z-30 w-60 bg-[#faf7fd] pt-14 shadow-lg transition-transform lg:translate-x-0 dark:bg-[#2c2648]"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <nav class="flex h-full flex-col overflow-y-auto p-3">
        <div class="space-y-1">
          <RouterLink
            v-for="item in menuAsideMain"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
            :class="
              route.path === item.to
                ? 'bg-[#7e57c2] font-semibold text-white'
                : 'text-gray-600 hover:bg-[#eee6f8] dark:text-slate-300 dark:hover:bg-[#3c3459]'
            "
            @click="sidebarOpen = false"
          >
            <BaseIcon :path="item.icon" size="20" />
            {{ item.label }}
          </RouterLink>
        </div>
        <div
          class="mt-auto space-y-1 border-t border-[#e7ddf3] pt-3 dark:border-[#4b4270]"
        >
          <button
            v-for="item in menuAsideBottom"
            :key="item.label"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-[#eee6f8] dark:text-slate-300 dark:hover:bg-[#3c3459]"
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
      class="fixed inset-0 z-20 bg-[#2c2648]/50 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- 内容 -->
    <div class="pt-14 lg:pl-60">
      <RouterView />
    </div>

    <footer
      class="border-t border-[#e7ddf3] py-4 text-center text-xs text-gray-400 lg:pl-60 dark:border-[#4b4270] dark:text-slate-500"
    >
      © 2026 {{ siteName }} · 基于 Admin One Tailwind Vue 3（MIT）构建
    </footer>
  </div>
</template>
