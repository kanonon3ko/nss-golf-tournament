<script setup>
import { computed, ref } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import PlayerBadge from '@/components/PlayerBadge.vue'
import MatchStatusPill from '@/components/MatchStatusPill.vue'
import BaseButton from '@/components/BaseButton.vue'
import MatchDetailModal from '@/components/MatchDetailModal.vue'
import ScoreEntryModal from '@/components/ScoreEntryModal.vue'
import { formatDateTime } from '@/utils/format'

const store = useTournamentStore()

const stageFilter = ref('all')
const statusFilter = ref('all')
const groupFilter = ref('all')
const detailMatch = ref(null)
const entryMatch = ref(null)

const stageOptions = [
  { value: 'all', label: '全部阶段' },
  { value: 'group', label: '小组赛' },
  { value: 'qf', label: '八强' },
  { value: 'sf', label: '半决赛' },
  { value: 'final', label: '决赛' },
]

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '未开始' },
  { value: 'complete', label: '已完赛' },
  { value: 'forfeit', label: '判负' },
  { value: 'overdue', label: '逾期' },
]

const rows = computed(() => {
  return store.matches
    .filter((m) => {
      const matchStage = m.stage
      const ddl = store.ddlForMatch(m)
      const overdue = m.status === 'pending' && ddl && new Date(ddl).getTime() < Date.now()
      const displayStatus = overdue ? 'overdue' : m.status
      const matchStageOk = stageFilter.value === 'all' || matchStage === stageFilter.value
      const matchStatusOk = statusFilter.value === 'all' || displayStatus === statusFilter.value
      const groupOk =
        groupFilter.value === 'all' ||
        (matchStage === 'group' && m.groupId === groupFilter.value)
      return matchStageOk && matchStatusOk && groupOk
    })
    .map((match) => {
      const ddl = store.ddlForMatch(match)
      const overdue = match.status === 'pending' && ddl && new Date(ddl).getTime() < Date.now()
      return { match, ddl, overdue }
    })
    .sort((a, b) => a.match.stage.localeCompare(b.match.stage) || (a.match.order || 0) - (b.match.order || 0) || a.match.id.localeCompare(b.match.id))
})

function stageLabel(match) {
  if (match.stage === 'group') return `${match.groupId}组 · 第${match.round}轮`
  return store.STAGE_LABELS[match.stage] || match.stage
}

function displayStatus(row) {
  return row.overdue ? 'overdue' : row.match.status
}

function forfeit(row, decision) {
  const match = row.match
  const labels = {
    A: `${store.playerName(match.playerAId)}负`,
    B: `${store.playerName(match.playerBId)}负`,
    both: '双方负',
    extend: '延期',
  }
  if (
    window.confirm(
      `确认对 ${store.playerName(match.playerAId)} vs ${store.playerName(match.playerBId)} 执行「${labels[decision]}」？`,
    )
  ) {
    store.forfeitMatch(match.id, decision)
  }
}
</script>

<template>
  <div class="p-6 xl:mx-auto xl:max-w-7xl">
    <div class="mb-5">
      <h1 class="text-2xl font-bold">赛果录入</h1>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        小组赛 BO3（先 2 局）· 淘汰赛 BO5（先 3 局）· 平局需选择 SD 胜者
      </p>
    </div>

    <div class="mb-4 flex flex-wrap gap-2">
      <select
        v-model="stageFilter"
        class="rounded-sm border border-gray-300 px-3 py-2 pr-8 text-sm dark:border-slate-600 dark:bg-slate-800"
      >
        <option v-for="opt in stageOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <select
        v-if="stageFilter === 'group' || stageFilter === 'all'"
        v-model="groupFilter"
        class="rounded-sm border border-gray-300 px-3 py-2 pr-8 text-sm dark:border-slate-600 dark:bg-slate-800"
      >
        <option value="all">全部小组</option>
        <option v-for="g in ['A', 'B', 'C', 'D']" :key="g" :value="g">{{ g }}组</option>
      </select>
      <select
        v-model="statusFilter"
        class="rounded-sm border border-gray-300 px-3 py-2 pr-8 text-sm dark:border-slate-600 dark:bg-slate-800"
      >
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-slate-900/70">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700 dark:text-slate-400">
            <th class="px-4 py-3">阶段</th>
            <th class="px-4 py-3">对阵</th>
            <th class="px-4 py-3">比分</th>
            <th class="px-4 py-3">DDL</th>
            <th class="px-4 py-3">状态</th>
            <th class="px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="{ match, ddl, overdue } in rows"
            :key="match.id"
            class="border-b border-gray-100 last:border-0 dark:border-slate-800"
            :class="overdue ? 'bg-red-50 dark:bg-red-900/10' : ''"
          >
            <td class="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-slate-400">{{ stageLabel(match) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 whitespace-nowrap">
                <PlayerBadge :player="store.playerById(match.playerAId)" size="sm" />
                <span class="text-gray-400">vs</span>
                <PlayerBadge :player="store.playerById(match.playerBId)" size="sm" />
              </div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 font-bold">
              {{
                match.status === 'complete'
                  ? `${store.matchScore(match).a} : ${store.matchScore(match).b}`
                  : match.status === 'forfeit'
                    ? '判负'
                    : '-'
              }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
              {{ formatDateTime(ddl) }}
            </td>
            <td class="px-4 py-3">
              <MatchStatusPill :status="displayStatus({ match, overdue })" />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1 whitespace-nowrap">
                <BaseButton label="查看" color="whiteDark" small @click="detailMatch = match" />
                <BaseButton
                  label="录入/编辑"
                  color="info"
                  small
                  @click="entryMatch = match"
                />
                <template v-if="match.status === 'pending'">
                  <BaseButton
                    :label="`${store.playerName(match.playerAId)}负`"
                    color="danger"
                    small
                    @click="forfeit({ match }, 'A')"
                  />
                  <BaseButton
                    :label="`${store.playerName(match.playerBId)}负`"
                    color="danger"
                    small
                    @click="forfeit({ match }, 'B')"
                  />
                  <BaseButton label="双方负" color="warning" small @click="forfeit({ match }, 'both')" />
                  <BaseButton label="延期" color="whiteDark" small @click="forfeit({ match }, 'extend')" />
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="6" class="px-4 py-8 text-center text-gray-400">没有符合条件的比赛</td>
          </tr>
        </tbody>
      </table>
    </div>

    <MatchDetailModal v-if="detailMatch" :match="detailMatch" @close="detailMatch = null" />
    <ScoreEntryModal
      v-if="entryMatch"
      :match="entryMatch"
      @close="entryMatch = null"
      @saved="entryMatch = null"
    />
  </div>
</template>
