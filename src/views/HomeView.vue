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
  const done = (n) => n.status === 'complete' || n.status === 'forfeit' || n.status === 'walkover'
  const finalDone = knock.some((n) => n.stage === 'final' && done(n))
  if (finalDone) return 3
  const sfDone = knock.some((n) => n.stage === 'sf' && done(n))
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
      class="relative mb-6 overflow-hidden rounded-2xl bg-[#faf7fd] p-6 text-emerald-950 shadow-xl md:p-8 dark:bg-linear-to-br dark:from-[#5f528c] dark:via-[#3d3560] dark:to-[#2a2440] dark:text-white"
    >
      <div
        class="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-[#b8860b] to-transparent"
      ></div>
      <div
        class="pointer-events-none absolute inset-0 hidden bg-linear-to-br from-white/15 via-white/5 to-transparent dark:block"
      ></div>
      <div class="relative z-10">
        <p
          class="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-emerald-700 dark:text-[#c3b3e6]"
        >
          <span class="inline-block h-2 w-2 rounded-full bg-[#b8860b]"></span>
          NSS · 16 人 · 小组赛 + 淘汰赛
        </p>
        <h1 class="mb-4 text-3xl font-black md:text-4xl">
          鬼吃鱼高尔夫锦标赛
          <span
            class="bg-linear-to-br from-[#f0d78c] via-[#c9a24b] to-[#8c6d1f] bg-clip-text text-transparent"
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
                ? 'border-[#c9a24b] bg-linear-to-br from-[#f0d78c] via-[#c9a24b] to-[#8c6d1f] text-[#241a08]'
                : stageOrder.indexOf(key) < stageIndex
                  ? 'border-emerald-600 bg-emerald-200/70 text-emerald-800 dark:border-[#7e6ba8] dark:bg-[#453b6b]/70 dark:text-[#cdbfe8]'
                  : 'border-emerald-300/70 bg-white/50 text-emerald-700 dark:border-white/20 dark:bg-white/5 dark:text-[#a99cc9]'
            "
          >
            {{ name }}
          </span>
        </div>
        <div class="mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-emerald-900/10 dark:bg-white/10">
          <div
            class="h-full rounded-full bg-linear-to-br from-[#f0d78c] via-[#c9a24b] to-[#8c6d1f] transition-all"
            :style="{ width: `${Math.max(0, (stageIndex + 1) / 4) * 100}%` }"
          ></div>
        </div>
      </div>
      <GolfBallMark
        size="240"
        class="absolute right-4 top-1/2 hidden -translate-y-1/2 opacity-60 sm:block"
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
      class="mb-6 rounded-2xl bg-yellow-50 p-6 text-center dark:bg-yellow-900/20"
    >
      <BaseIcon :path="mdiTrophy" size="40" class="mx-auto mb-2 text-yellow-500" />
      <p class="mb-1 text-sm text-yellow-700 dark:text-yellow-400">🏆 2026 冠军</p>
      <p
        class="bg-linear-to-r from-[#f7e7b0] via-[#c9a24b] to-[#8c6d1f] bg-clip-text text-3xl font-black text-transparent"
      >
        {{ champion.name }}
      </p>
      <template v-if="store.runnerUpId">
        <p class="mt-3 text-sm font-semibold text-yellow-700/80 dark:text-yellow-400/80">🥈 亚军</p>
        <p
          class="bg-linear-to-r from-[#94a3b8] via-[#e2e8f0] to-[#64748b] bg-clip-text text-2xl font-bold text-transparent"
        >
          {{ store.playerName(store.runnerUpId) }}
        </p>
      </template>
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

      <div
        class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80"
        :class="store.championId ? 'lg:col-span-2' : ''"
      >
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
