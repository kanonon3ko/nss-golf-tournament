<script setup>
import { computed, ref } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import { useAuthStore } from '@/stores/auth'
import GroupTabs from '@/components/GroupTabs.vue'
import PlayerBadge from '@/components/PlayerBadge.vue'
import MatchStatusPill from '@/components/MatchStatusPill.vue'
import BaseButton from '@/components/BaseButton.vue'
import MatchDetailModal from '@/components/MatchDetailModal.vue'
import ScoreEntryModal from '@/components/ScoreEntryModal.vue'
import { formatDateTime } from '@/utils/format'

const store = useTournamentStore()
const auth = useAuthStore()

const activeGroup = ref('A')
const statusFilter = ref('all')
const detailMatch = ref(null)
const entryMatch = ref(null)

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '未开始' },
  { value: 'complete', label: '已完赛' },
  { value: 'forfeit', label: '判负' },
  { value: 'overdue', label: '逾期' },
]

const groupMatches = computed(() => store.groupMatches[activeGroup.value])

const filteredMatches = computed(() => {
  const rows = groupMatches.value.map((match) => {
    const ddl = store.ddlForMatch(match)
    const overdue = match.status === 'pending' && ddl && new Date(ddl).getTime() < Date.now()
    return { match, ddl, overdue }
  })
  if (statusFilter.value === 'all') return rows
  if (statusFilter.value === 'overdue') return rows.filter((r) => r.overdue)
  return rows.filter((r) => r.match.status === statusFilter.value)
})

function displayStatus(row) {
  return row.overdue ? 'overdue' : row.match.status
}

function openDetail(match) {
  detailMatch.value = match
}

function openEntry(match) {
  entryMatch.value = match
}

function onEntrySaved() {
  entryMatch.value = null
}

</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">小组赛</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400">
          每组 6 场 · 三局两胜（BO3）· 胜 2 分 / 负 1 分
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          type="button"
          class="rounded-full px-3 py-1 text-sm"
          :class="
            statusFilter === f.value
              ? 'bg-[#2c2648] font-semibold text-white dark:bg-[#8a7fb0] dark:text-slate-900'
              : 'bg-[#faf7fd] text-gray-600 shadow-sm hover:bg-[#eee6f8] dark:bg-[#2c2648] dark:text-slate-300'
          "
          @click="statusFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="mb-5">
      <GroupTabs v-model="activeGroup" />
    </div>

    <div class="mb-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-slate-400">
      <span
        v-for="round in [1, 2, 3]"
        :key="round"
      >
        第{{ round }}轮 DDL：
        {{ formatDateTime(store.ddlRounds.find((d) => d.stage === 'group' && d.round === round)?.ddl) }}
      </span>
    </div>

    <div class="rounded-2xl bg-[#faf7fd] shadow-sm dark:bg-[#332c54]/80">
      <div class="hidden overflow-x-auto lg:block">
      <table class="w-full table-fixed text-sm">
        <thead>
          <tr class="border-b border-[#e7ddf3] text-left text-xs text-gray-500 dark:border-[#4b4270] dark:text-slate-400">
            <th class="w-20 px-4 py-3">轮次</th>
            <th class="w-[320px] px-4 py-3">对阵</th>
            <th class="w-20 px-4 py-3">比分</th>
            <th class="w-16 px-4 py-3">SD</th>
            <th class="w-48 px-4 py-3">DDL</th>
            <th class="w-28 px-4 py-3">状态</th>
            <th class="w-36 px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="{ match, ddl, overdue } in filteredMatches"
            :key="match.id"
            class="border-b border-[#f0e9f8] last:border-0 dark:border-[#3f3760]"
            :class="overdue ? 'bg-red-50 dark:bg-red-900/10' : ''"
          >
            <td class="px-4 py-3 font-semibold text-gray-500 dark:text-slate-400">
              第 {{ match.round }} 轮
            </td>
            <td class="px-4 py-3">
              <div class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
                <PlayerBadge :player="store.playerById(match.playerAId)" />
                <span class="text-center text-gray-400">vs</span>
                <PlayerBadge
                  :player="store.playerById(match.playerBId)"
                  reverse
                  class="justify-self-end"
                />
              </div>
            </td>
            <td class="px-4 py-3 font-bold">
              {{
                match.status === 'complete'
                  ? `${store.matchScore(match).a} : ${store.matchScore(match).b}`
                  : match.status === 'forfeit'
                    ? '判负'
                    : '-'
              }}
            </td>
            <td class="px-4 py-3 text-gray-400">
              {{
                match.sets.some(
                  (s) => s.a != null && s.b != null && s.a === s.b,
                )
                  ? '是'
                  : '-'
              }}
            </td>
            <td class="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
              {{ formatDateTime(ddl) }}
            </td>
            <td class="px-4 py-3">
              <MatchStatusPill :status="displayStatus({ match, overdue })" />
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex flex-wrap items-center justify-end gap-1">
                <BaseButton label="查看" color="whiteDark" small @click="openDetail(match)" />
                <BaseButton
                  v-if="auth.isAdmin"
                  label="录入"
                  color="purple"
                  small
                  @click="openEntry(match)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!filteredMatches.length">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">暂无比赛</td>
          </tr>
        </tbody>
      </table>
      </div>
      <div class="divide-y divide-[#f0e9f8] lg:hidden dark:divide-[#3f3760]">
        <div
          v-for="{ match, ddl, overdue } in filteredMatches"
          :key="match.id"
          class="p-4"
          :class="overdue ? 'bg-red-50 dark:bg-red-900/10' : ''"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-gray-500 dark:text-slate-400">
              第 {{ match.round }} 轮
            </span>
            <MatchStatusPill :status="displayStatus({ match, overdue })" />
          </div>
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <PlayerBadge :player="store.playerById(match.playerAId)" size="sm" />
            <span class="text-center text-gray-400">vs</span>
            <PlayerBadge
              :player="store.playerById(match.playerBId)"
              size="sm"
              reverse
              class="justify-self-end"
            />
          </div>
          <div class="mt-3 text-center">
            <span class="text-3xl font-black text-gray-800 dark:text-slate-100">{{
              match.status === 'complete'
                ? `${store.matchScore(match).a} : ${store.matchScore(match).b}`
                : match.status === 'forfeit'
                  ? '判负'
                  : '-'
            }}</span>

          </div>
          <div
            class="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-slate-400"
          >
            <span>{{ formatDateTime(ddl) }}</span>
            <div class="flex gap-1">
              <BaseButton label="查看" color="whiteDark" small @click="openDetail(match)" />
              <BaseButton
                v-if="auth.isAdmin"
                label="录入"
                color="purple"
                small
                @click="openEntry(match)"
              />
            </div>
          </div>
        </div>
        <div v-if="!filteredMatches.length" class="p-6 text-center text-sm text-gray-400">
          暂无比赛
        </div>
      </div>
    </div>

    <MatchDetailModal
      v-if="detailMatch"
      :match="detailMatch"
      @close="detailMatch = null"
    />
    <ScoreEntryModal
      v-if="entryMatch"
      :match="entryMatch"
      @close="entryMatch = null"
      @saved="onEntrySaved"
    />
  </div>
</template>
