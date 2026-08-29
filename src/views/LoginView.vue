<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTournamentStore } from '@/stores/tournament'
import { siteName } from '@/config'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiLock, mdiEye, mdiEyeOff, mdiTrophy } from '@mdi/js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const tournamentStore = useTournamentStore()

const password = ref('')
const showPassword = ref(false)
const error = ref('')
const lockedUntil = ref(0)
const failedCount = ref(0)

async function submit() {
  error.value = ''
  if (Date.now() < lockedUntil.value) {
    error.value = '尝试过于频繁，请稍后再试'
    return
  }
  if (!password.value) {
    error.value = '请输入管理员口令'
    return
  }
  if (await auth.login(password.value)) {
    tournamentStore.ensureCloudSync()
    const next = typeof route.query.next === 'string' ? route.query.next : '/admin'
    router.replace(next)
    return
  }
  failedCount.value += 1
  if (failedCount.value >= 5) {
    lockedUntil.value = Date.now() + 5 * 60 * 1000
    failedCount.value = 0
    error.value = '连续失败 5 次，已锁定 5 分钟'
  } else {
    error.value = `口令错误，请重试（已失败 ${failedCount.value} 次）`
  }
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-slate-800 dark:text-slate-100"
  >
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <span
          class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-tr from-emerald-800 via-emerald-900 to-slate-900 text-[#c9a24b]"
        >
          <BaseIcon :path="mdiTrophy" size="26" />
        </span>
        <h1 class="text-xl font-bold">{{ siteName }}</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">管理员登录 · 组织方专用</p>
      </div>

      <form
        class="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/70"
        @submit.prevent="submit"
      >
        <label class="mb-2 block text-sm font-bold">管理员口令</label>
        <div class="relative mb-3">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <BaseIcon :path="mdiLock" size="18" />
          </span>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入口令"
            class="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 dark:border-slate-600 dark:bg-slate-800"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showPassword = !showPassword"
          >
            <BaseIcon :path="showPassword ? mdiEyeOff : mdiEye" size="18" />
          </button>
        </div>

        <p v-if="error" class="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30">
          {{ error }}
        </p>

        <BaseButton type="submit" label="登录" color="info" class="w-full" />
        <BaseButton
          class="mt-2 w-full"
          label="以游客身份继续浏览"
          color="whiteDark"
          @click="router.push('/')"
        />
      </form>

      <p class="mt-4 text-center text-xs text-gray-400">
        登录后仅组织方可编辑赛事数据，选手与游客浏览不受影响。
      </p>
    </div>
  </div>
</template>
