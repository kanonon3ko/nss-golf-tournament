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

function groupChipClass(groupId) {
  const map = {
    A: 'rounded-full bg-[#e6e0f5] px-2 py-0.5 text-sm font-semibold text-[#37352f] dark:bg-[#7469a6] dark:text-[#e5e1f2]',
    B: 'rounded-full bg-[#d9f3e1] px-2 py-0.5 text-sm font-semibold text-[#37352f] dark:bg-[#6b7f72] dark:text-[#e0ebe4]',
    C: 'rounded-full bg-[#dcecfa] px-2 py-0.5 text-sm font-semibold text-[#37352f] dark:bg-[#6b7890] dark:text-[#e1e8f4]',
    D: 'rounded-full bg-[#ffe8d4] px-2 py-0.5 text-sm font-semibold text-[#37352f] dark:bg-[#8c7363] dark:text-[#f2e6dc]',
  }
  return map[groupId] || ''
}

function tierClass(tier) {
  const map = {
    1: 'rounded-full bg-[#e6e0f5] px-2 py-0.5 text-sm font-semibold text-[#391c57] dark:bg-[#52497b] dark:text-[#dec4f8]',
    2: 'rounded-full bg-[#dcecfa] px-2 py-0.5 text-sm font-semibold text-[#005bab] dark:bg-[#4a4d7c] dark:text-[#b4d6f8]',
    3: 'rounded-full bg-[#d9f3e1] px-2 py-0.5 text-sm font-semibold text-[#12902d] dark:bg-emerald-900/40 dark:text-emerald-400',
    4: 'rounded-full bg-[#f0eeec] px-2 py-0.5 text-sm font-semibold text-[#5d5b54] dark:bg-[#524b7a] dark:text-slate-300',
  }
  return map[tier] || ''
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">选手</h1>
        <p class="text-sm text-[#5d5b54] dark:text-slate-400">共 {{ store.players.length }} 名选手 · 按档位分组</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a4a097]">
            <BaseIcon :path="mdiMagnify" size="16" />
          </span>
          <input
            v-model="search"
            type="search"
            placeholder="搜索选手 ID"
            class="w-56 rounded-full border border-[#c8c4be] py-2 pl-9 pr-3 text-sm dark:border-[#675d8e] dark:bg-[#423b69]"
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
                ? 'notion-pill-active font-semibold'
                : 'bg-[#f6f5f4] text-[#5d5b54] hover:bg-[#e8e6e2] dark:bg-[#423b69] dark:text-slate-300'
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
        class="notion-card flex flex-col gap-3 p-4 text-left transition-shadow hover:shadow-md"
        @click="router.push(`/players/${player.id}`)"
      >
        <div class="flex items-center justify-between gap-2">
          <PlayerBadge :player="player" size="lg" truncate class="min-w-0" />
          <span
            v-if="statsOf(player)"
            class="shrink-0 rounded-full bg-[#d9f3e1] px-2 py-0.5 text-sm font-semibold text-[#1aae39] dark:bg-emerald-900/40 dark:text-emerald-400"
          >
            {{ statsOf(player).points }} 分
          </span>
        </div>
        <div class="flex flex-wrap gap-1">
          <span class="rounded-full px-2 py-0.5 text-sm font-semibold" :class="tierClass(player.tier)">
            {{ player.tier }}档
          </span>
          <span
            v-if="player.groupId"
            class="rounded-full px-2 py-0.5 text-sm font-semibold"
            :class="groupChipClass(player.groupId)"
          >
            {{ player.groupId }}组
          </span>
        </div>
        <div
          v-if="statsOf(player)"
          class="mt-auto grid grid-cols-3 gap-1 border-t border-[#ede9e4] pt-2 text-center text-sm text-[#5d5b54] dark:border-[#4a426e] dark:text-slate-400"
        >
          <div>
            <p class="text-base font-bold text-[#1a1a1a] dark:text-slate-100">{{ statsOf(player).played }}</p>
            <p>场次</p>
          </div>
          <div>
            <p class="text-base font-bold text-[#1a1a1a] dark:text-slate-100">{{ statsOf(player).points }}</p>
            <p>积分</p>
          </div>
          <div>
            <p class="text-base font-bold text-[#1a1a1a] dark:text-slate-100">{{ statsOf(player).setDiff }}</p>
            <p>净胜局</p>
          </div>
        </div>
        <p v-else class="text-sm text-[#a4a097]">未分组</p>
      </button>
    </div>

    <p v-if="!players.length" class="py-12 text-center text-[#a4a097]">没有匹配的选手</p>
  </div>
</template>
