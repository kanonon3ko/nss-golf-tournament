<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { siteName } from '@/config'
import {
  mdiMenu,
  mdiClose,
  mdiLock,
  mdiLogout,
  mdiViewDashboard,
  mdiWhiteBalanceSunny,
  mdiWeatherNight,
} from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'
import BaseButton from '@/components/BaseButton.vue'
import GolfLogo from '@/components/GolfLogo.vue'
import { useDarkModeStore } from '@/stores/darkMode'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const darkModeStore = useDarkModeStore()
const mobileOpen = ref(false)

const navItems = [
  { to: '/', label: '首页', exact: true },
  { to: '/groups', label: '小组赛' },
  { to: '/standings', label: '积分榜' },
  { to: '/bracket', label: '淘汰赛' },
  { to: '/players', label: '选手' },
  { to: '/rules', label: '规则' },
]

function isActive(item) {
  if (item.exact) return route.path === '/'
  return route.path.startsWith(item.to)
}

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#ede2f6] dark:bg-linear-to-br dark:from-[#7d6ba8] dark:to-[#2a2440] dark:text-slate-100">
    <header
      class="sticky top-0 z-40 border-b border-[#e7ddf3] bg-[#f8f4fd]/90 backdrop-blur dark:border-[#4b4270] dark:bg-[#2c2648]/90"
    >
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <RouterLink to="/" class="flex items-center gap-2 font-bold">
          <GolfLogo :size="32" />
          <span>{{ siteName }}</span>
        </RouterLink>

        <nav class="hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-2 text-sm transition-colors"
            :class="
              isActive(item)
                ? 'bg-[#eae0f8] font-semibold text-[#7e57c2] dark:bg-[#3c3459] dark:text-[#a78bdc]'
                : 'text-gray-600 hover:bg-[#eee6f8] dark:text-slate-300 dark:hover:bg-[#463e68]'
            "
          >
            {{ item.label }}
          </RouterLink>
          <div class="ms-2 flex items-center gap-1">
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#eee6f8] dark:text-slate-300 dark:hover:bg-[#463e68]"
              :title="darkModeStore.isEnabled ? '切换到浅色模式' : '切换到深色模式'"
              @click="darkModeStore.set(null, true)"
            >
              <BaseIcon
                :path="darkModeStore.isEnabled ? mdiWhiteBalanceSunny : mdiWeatherNight"
                size="20"
              />
            </button>
            <template v-if="auth.isAdmin">
              <BaseButton
                :to="'/admin'"
                :icon="mdiViewDashboard"
                label="主办方后台"
                color="purple"
                small
              />
              <BaseButton :icon="mdiLogout" label="退出" color="whiteDark" small @click="logout" />
            </template>
            <BaseButton
              v-else
              :to="{ name: 'login', query: { next: route.fullPath } }"
              :icon="mdiLock"
              label="主办方登录"
              color="purple"
              small
            />
          </div>
        </nav>

        <div class="flex items-center gap-1 md:hidden">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#eee6f8] dark:text-slate-300 dark:hover:bg-[#463e68]"
            :title="darkModeStore.isEnabled ? '切换到浅色模式' : '切换到深色模式'"
            @click="darkModeStore.set(null, true)"
          >
            <BaseIcon
              :path="darkModeStore.isEnabled ? mdiWhiteBalanceSunny : mdiWeatherNight"
              size="20"
            />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#eee6f8] dark:hover:bg-[#463e68]"
            @click="mobileOpen = !mobileOpen"
          >
            <BaseIcon :path="mobileOpen ? mdiClose : mdiMenu" size="24" />
          </button>
        </div>
      </div>

      <nav
        v-if="mobileOpen"
        class="border-t border-[#e7ddf3] px-4 pb-4 md:hidden dark:border-[#4b4270]"
      >
        <div class="flex flex-col gap-1 py-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-2 text-sm"
            :class="
              isActive(item)
                ? 'bg-[#eae0f8] font-semibold text-[#7e57c2] dark:bg-[#3c3459] dark:text-[#a78bdc]'
                : 'text-gray-600 dark:text-slate-300'
            "
            @click="mobileOpen = false"
          >
            {{ item.label }}
          </RouterLink>
        </div>
        <div class="flex gap-2 border-t border-[#e7ddf3] pt-3 dark:border-[#4b4270]">
          <template v-if="auth.isAdmin">
            <BaseButton :to="'/admin'" :icon="mdiViewDashboard" label="主办方后台" color="purple" small />
            <BaseButton :icon="mdiLogout" label="退出" color="whiteDark" small @click="logout" />
          </template>
          <BaseButton
            v-else
            :to="{ name: 'login', query: { next: route.fullPath } }"
            :icon="mdiLock"
            label="主办方登录"
            color="purple"
            small
          />
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer
      class="border-t border-[#e7ddf3] py-6 text-center text-xs text-gray-400 dark:border-[#4b4270] dark:text-slate-500"
    >
      <div class="mx-auto max-w-6xl px-4">
        <p>© 2026 {{ siteName }} · 数据仅供赛事记录，截图与录屏由主办方留存</p>
        <p class="mt-1">
          基于
          <a
            href="https://justboil.me/tailwind-admin-templates/free-vue-dashboard/"
            target="_blank"
            rel="noopener"
            class="underline"
          >
            Admin One Tailwind Vue 3
          </a>
          （MIT）构建
        </p>
      </div>
    </footer>
  </div>
</template>
