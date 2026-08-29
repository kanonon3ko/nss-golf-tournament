<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTournamentStore } from '@/stores/tournament'
import PlayerBadge from '@/components/PlayerBadge.vue'
import { mdiMagnify } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'

const store = useTournamentStore()
const router = useRouter()

const search = ref('')
const tierFilter = ref(0)

const tiers = [
  { value: 0, label: '全部' },
  { value: 1, label: '1档' },
  { value: 2, label: '2档' },
  { value: 3, label: '3档' },
  { value: 4, label: '4档' },
]

const players = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.players
    .filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q)
      const matchT = tierFilter.value === 0 || p.tier === tierFilter.value
      return matchQ && matchT
    })
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, 'zh'))
})

function statsOf(player) {
  if (!player.groupId) return null
  return store.getStandings(player.groupId).find((r) => r.playerId === player.id) || null
}

function tierClass(tier) {
  const map = {
    1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    3: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    4: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  }
  return map[tier] || ''
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">选手</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400">共 {{ store.players.length }} 名选手 · 按档位分组</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <BaseIcon :path="mdiMagnify" size="16" />
          </span>
          <input
            v-model="search"
            type="search"
            placeholder="搜索选手 ID"
            class="w-56 rounded-full border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="t in tiers"
            :key="t.value"
            type="button"
            class="rounded-full px-3 py-1.5 text-sm"
            :class="
              tierFilter === t.value
                ? 'bg-slate-800 font-semibold text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100 dark:bg-slate-900 dark:text-slate-300'
            "
            @click="tierFilter = t.value"
          >
            {{ t.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <button
        v-for="player in players"
        :key="player.id"
        type="button"
        class="flex flex-col gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900/70"
        @click="router.push(`/players/${player.id}`)"
      >
        <div class="flex items-center justify-between gap-2">
          <PlayerBadge :player="player" size="lg" />
          <span
            v-if="statsOf(player)"
            class="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          >
            {{ statsOf(player).points }} 分
          </span>
        </div>
        <div class="flex flex-wrap gap-1">
          <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="tierClass(player.tier)">
            {{ player.tier }}档
          </span>
          <span
            v-if="player.groupId"
            class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-slate-800 dark:text-slate-400"
          >
            {{ player.groupId }}组
          </span>
        </div>
        <div
          v-if="statsOf(player)"
          class="mt-auto grid grid-cols-3 gap-1 border-t border-gray-100 pt-2 text-center text-xs text-gray-500 dark:border-slate-800 dark:text-slate-400"
        >
          <div>
            <p class="text-base font-bold text-gray-800 dark:text-slate-100">{{ statsOf(player).played }}</p>
            <p>场次</p>
          </div>
          <div>
            <p class="text-base font-bold text-gray-800 dark:text-slate-100">{{ statsOf(player).points }}</p>
            <p>积分</p>
          </div>
          <div>
            <p class="text-base font-bold text-gray-800 dark:text-slate-100">{{ statsOf(player).setDiff }}</p>
            <p>净胜局</p>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400">未分组</p>
      </button>
    </div>

    <p v-if="!players.length" class="py-12 text-center text-gray-400">没有匹配的选手</p>
  </div>
</template>
