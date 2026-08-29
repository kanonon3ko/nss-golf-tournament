<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { siteName } from '@/config'
import {
  mdiTrophy,
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
  <div class="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-800 dark:text-slate-100">
    <header
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90"
    >
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <RouterLink to="/" class="flex items-center gap-2 font-bold">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-tr from-emerald-800 via-emerald-900 to-slate-900 text-[#c9a24b]"
          >
            <BaseIcon :path="mdiTrophy" size="18" />
          </span>
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
                ? 'bg-emerald-50 font-semibold text-emerald-600 dark:bg-slate-800 dark:text-emerald-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
            "
          >
            {{ item.label }}
          </RouterLink>
          <div class="ms-2 flex items-center gap-1">
            <button
              type="button"
              class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
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
                label="管理后台"
                color="info"
                small
              />
              <BaseButton :icon="mdiLogout" label="退出" color="whiteDark" small @click="logout" />
            </template>
            <BaseButton
              v-else
              :to="{ name: 'login', query: { next: route.fullPath } }"
              :icon="mdiLock"
              label="管理员登录"
              color="info"
              small
            />
          </div>
        </nav>

        <button
          type="button"
          class="rounded-md p-1 hover:bg-gray-100 md:hidden dark:hover:bg-slate-700"
          @click="mobileOpen = !mobileOpen"
        >
          <BaseIcon :path="mobileOpen ? mdiClose : mdiMenu" size="24" />
        </button>
      </div>

      <nav
        v-if="mobileOpen"
        class="border-t border-gray-200 px-4 pb-4 md:hidden dark:border-slate-700"
      >
        <div class="flex flex-col gap-1 py-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-2 text-sm"
            :class="
              isActive(item)
                ? 'bg-emerald-50 font-semibold text-emerald-600 dark:bg-slate-800 dark:text-emerald-400'
                : 'text-gray-600 dark:text-slate-300'
            "
            @click="mobileOpen = false"
          >
            {{ item.label }}
          </RouterLink>
        </div>
        <div class="flex gap-2 border-t border-gray-200 pt-3 dark:border-slate-700">
          <button
            type="button"
            class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
            :title="darkModeStore.isEnabled ? '切换到浅色模式' : '切换到深色模式'"
            @click="darkModeStore.set(null, true)"
          >
            <BaseIcon
              :path="darkModeStore.isEnabled ? mdiWhiteBalanceSunny : mdiWeatherNight"
              size="20"
            />
          </button>
          <template v-if="auth.isAdmin">
            <BaseButton :to="'/admin'" :icon="mdiViewDashboard" label="管理后台" color="info" small />
            <BaseButton :icon="mdiLogout" label="退出" color="whiteDark" small @click="logout" />
          </template>
          <BaseButton
            v-else
            :to="{ name: 'login', query: { next: route.fullPath } }"
            :icon="mdiLock"
            label="管理员登录"
            color="info"
            small
          />
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer
      class="border-t border-gray-200 py-6 text-center text-xs text-gray-400 dark:border-slate-700 dark:text-slate-500"
    >
      <div class="mx-auto max-w-6xl px-4">
        <p>© 2026 {{ siteName }} · 数据仅供赛事记录，截图与录屏由组织方留存</p>
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
