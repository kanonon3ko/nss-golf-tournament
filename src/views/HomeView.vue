<script setup>
import { computed } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime, formatCountdown } from '@/utils/format'
import MatchStatusPill from '@/components/MatchStatusPill.vue'
import GolfBallMark from '@/components/GolfBallMark.vue'
import BaseButton from '@/components/BaseButton.vue'
import {
  mdiCalendarClock,
  mdiTrophy,
  mdiChevronRight,
} from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'

const store = useTournamentStore()
const auth = useAuthStore()

const stageOrder = ['group', 'qf', 'sf', 'final']
const stageNames = { group: '小组赛', qf: '八强', sf: '半决赛', final: '决赛' }

const stageIndex = computed(() => {
  if (store.stage === 'setup') return -1
  if (store.stage === 'finished') return 4
  if (store.stage === 'group') return 0
  const knock = store.knockoutMatches
  const finalDone = knock.some((n) => n.stage === 'final' && n.status === 'complete')
  if (finalDone) return 3
  const sfDone = knock.some((n) => n.stage === 'sf' && n.status === 'complete')
  if (sfDone) return 2
  return 1
})

const currentDdl = computed(() => {
  if (store.stage === 'setup' || store.stage === 'finished') return null
  if (store.stage === 'group') {
    const rounds = [1, 2, 3]
    for (const round of rounds) {
      const item = store.ddlRounds.find((d) => d.stage === 'group' && d.round === round)
      const pending = store.matches.filter(
        (m) => m.stage === 'group' && m.round === round && m.status === 'pending',
      ).length
      if (item?.ddl && pending > 0) {
        return { label: `小组赛第${round}轮`, ddl: item.ddl, pending }
      }
    }
    const item = store.ddlRounds.find((d) => d.stage === 'group' && d.round === 3)
    return { label: '小组赛第3轮', ddl: item?.ddl, pending: 0 }
  }
  const stage = store.stage === 'knockout' ? 'qf' : store.stage
  const item = store.ddlRounds.find((d) => d.stage === stage)
  const pending = store.matches.filter((m) => m.stage === stage && m.status === 'pending').length
  return { label: stageNames[stage], ddl: item?.ddl || null, pending }
})

const standingsSummary = computed(() => {
  const out = {}
  for (const g of ['A', 'B', 'C', 'D']) {
    out[g] = store.getStandings(g).slice(0, 4)
  }
  return out
})

const champion = computed(() => store.playerById(store.championId))
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div
      class="relative mb-6 overflow-hidden rounded-2xl bg-linear-to-tr from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white shadow-xl md:p-8"
    >
      <div
        class="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-[#b8860b] to-transparent"
      ></div>
      <div class="relative z-10">
        <p
          class="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-emerald-300"
        >
          <span class="inline-block h-2 w-2 rounded-full bg-[#b8860b]"></span>
          NSS · 16 人 · 小组赛 + 淘汰赛
        </p>
        <h1 class="mb-4 text-3xl font-black md:text-4xl">
          鬼吃鱼高尔夫锦标赛
          <span
            class="bg-linear-to-r from-[#f0d78c] via-[#c9a24b] to-[#8c6d1f] bg-clip-text text-transparent"
          >
            2026
          </span>
        </h1>
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="(name, key) in stageNames"
            :key="key"
            class="rounded-full border px-3 py-1 text-sm font-semibold"
            :class="
              stageOrder.indexOf(key) === stageIndex
                ? 'border-[#c9a24b] bg-linear-to-r from-[#f0d78c] via-[#c9a24b] to-[#8c6d1f] text-[#241a08]'
                : stageOrder.indexOf(key) < stageIndex
                  ? 'border-emerald-700 bg-emerald-900/50 text-emerald-200'
                  : 'border-white/20 bg-white/5 text-emerald-100'
            "
          >
            {{ name }}
          </span>
        </div>
        <div class="mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full bg-linear-to-r from-[#f0d78c] via-[#c9a24b] to-[#8c6d1f] transition-all"
            :style="{ width: `${Math.max(0, (stageIndex + 1) / 4) * 100}%` }"
          ></div>
        </div>
      </div>
      <GolfBallMark
        size="240"
        class="absolute -right-6 -bottom-8 opacity-60"
      />
    </div>

    <div v-if="store.stage === 'setup'" class="mb-6 rounded-2xl bg-amber-50 p-5 dark:bg-amber-900/20">
      <p class="font-semibold text-amber-700 dark:text-amber-400">
        赛事尚未开始：分组未发布，暂无赛程。
      </p>
      <BaseButton
        v-if="auth.isAdmin"
        class="mt-3"
        to="/admin/players"
        color="purple"
        label="去抽签分组"
      />
    </div>

    <div
      v-if="store.championId && champion"
      class="mb-6 flex items-center gap-4 rounded-2xl bg-yellow-50 p-5 dark:bg-yellow-900/20"
    >
      <BaseIcon :path="mdiTrophy" size="40" class="text-yellow-500" />
      <div>
        <p class="text-sm text-yellow-700 dark:text-yellow-400">🏆 2026 冠军</p>
        <p class="text-xl font-bold text-yellow-800 dark:text-yellow-200">
          {{ champion.name }}
        </p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div
        v-if="currentDdl"
        class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80"
      >
        <div class="mb-3 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-slate-400">
          <BaseIcon :path="mdiCalendarClock" size="18" />
          当前轮次 DDL
        </div>
        <p class="text-lg font-bold">{{ currentDdl.label }}</p>
        <p class="text-gray-500 dark:text-slate-400">{{ formatDateTime(currentDdl.ddl) }}</p>
        <p
          class="mt-1 text-sm font-semibold"
          :class="currentDdl.pending ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'"
        >
          {{ currentDdl.pending ? `${currentDdl.pending} 场比赛待完成 · ${formatCountdown(currentDdl.ddl)}` : '本轮比赛已完成' }}
        </p>
        <BaseButton
          v-if="auth.isAdmin"
          class="mt-3"
          to="/admin/ddl"
          color="purple"
          small
          label="去设置 DDL"
        />
      </div>

      <div class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-bold text-gray-500 dark:text-slate-400">最近赛果</span>
          <RouterLink to="/groups" class="flex items-center gap-0.5 text-sm text-emerald-600">
            查看全部
            <BaseIcon :path="mdiChevronRight" size="16" />
          </RouterLink>
        </div>
        <div v-if="store.latestResults.length" class="flex flex-col gap-2">
          <div
            v-for="match in store.latestResults"
            :key="match.id"
            class="flex items-center justify-between rounded-xl bg-[#f4eefa] px-3 py-2 text-sm dark:bg-[#3c3459]"
          >
            <span class="truncate">
              {{ store.playerName(match.playerAId) }}
              <b>{{ store.matchScore(match).a }}:{{ store.matchScore(match).b }}</b>
              {{ store.playerName(match.playerBId) }}
            </span>
            <span class="text-xs text-gray-400">{{ formatDateTime(match.updatedAt) }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400">暂无已完赛记录</p>
      </div>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <div class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-bold text-gray-500 dark:text-slate-400">各组积分榜速览</span>
          <RouterLink to="/standings" class="flex items-center gap-0.5 text-sm text-emerald-600">
            进入积分榜
            <BaseIcon :path="mdiChevronRight" size="16" />
          </RouterLink>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="g in ['A', 'B', 'C', 'D']" :key="g" class="rounded-xl bg-[#f4eefa] p-3 dark:bg-[#3c3459]">
            <p class="mb-2 text-xs font-bold text-gray-400">{{ g }} 组</p>
            <div v-for="row in standingsSummary[g]" :key="row.playerId" class="flex justify-between py-0.5 text-sm">
              <span class="text-gray-600 dark:text-slate-300">{{ row.rank }}. {{ row.name }}</span>
              <span class="font-semibold">{{ row.points }} 分</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-bold text-gray-500 dark:text-slate-400">淘汰赛进度</span>
          <RouterLink to="/bracket" class="flex items-center gap-0.5 text-sm text-emerald-600">
            进入对阵
            <BaseIcon :path="mdiChevronRight" size="16" />
          </RouterLink>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="node in store.knockoutMatches"
            :key="`${node.stage}-${node.order}`"
            class="flex items-center justify-between rounded-xl bg-[#f4eefa] px-3 py-2 text-sm dark:bg-[#3c3459]"
          >
            <span class="font-semibold text-gray-500 dark:text-slate-400">{{ node.label }}</span>
            <span class="flex items-center gap-2">
              <span v-if="node.playerAId && node.playerBId" class="text-gray-600 dark:text-slate-300">
                {{ store.playerName(node.playerAId) }} vs {{ store.playerName(node.playerBId) }}
              </span>
              <span v-else class="text-gray-400">{{ node.expectedA }} vs {{ node.expectedB }}</span>
              <MatchStatusPill :status="node.status" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
