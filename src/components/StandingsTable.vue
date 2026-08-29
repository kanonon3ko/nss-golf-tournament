<script setup>
import { computed } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import { useAuthStore } from '@/stores/auth'
import PlayerBadge from '@/components/PlayerBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiDiceMultiple } from '@mdi/js'

const props = defineProps({
  groupId: {
    type: String,
    required: true,
  },
})

const store = useTournamentStore()
const auth = useAuthStore()

const rows = computed(() => store.getStandings(props.groupId))
const complete = computed(() => !!store.groupComplete[props.groupId])
const hasDraw = computed(() => rows.value.some((row) => row.needsDraw))

function resolveDraw() {
  const names = rows.value
    .filter((row) => row.needsDraw)
    .map((row) => row.name)
    .join('、')
  if (window.confirm(`按规则顺序仍无法区分 ${names}，是否发起随机抽签？`)) {
    store.resolveTiebreak(props.groupId)
  }
}

function rankClass(rank) {
  if (rank === 1) return 'bg-yellow-400 text-yellow-950'
  if (rank === 2) return 'bg-[#d8ccec] text-slate-800 dark:bg-[#554c7d]'
  return 'bg-[#eee6f8] text-gray-500 dark:bg-[#3c3459] dark:text-slate-400'
}
</script>

<template>
  <div>
    <div class="rounded-2xl bg-[#faf7fd] shadow-sm dark:bg-[#332c54]/80">
      <div class="hidden overflow-x-auto lg:block">
      <table class="w-full table-fixed text-sm">
        <thead>
          <tr class="border-b border-[#e7ddf3] text-left text-xs text-gray-500 dark:border-[#4b4270] dark:text-slate-400">
            <th class="w-16 px-4 py-3">排名</th>
            <th class="w-48 px-4 py-3">选手</th>
            <th class="w-20 px-4 py-3">场</th>
            <th class="w-20 px-4 py-3">胜</th>
            <th class="w-20 px-4 py-3">负</th>
            <th class="w-20 px-4 py-3">积分</th>
            <th class="w-20 px-4 py-3">净胜局</th>
            <th class="w-20 px-4 py-3">净胜杆</th>
            <th class="w-20 px-4 py-3">备注</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.playerId"
            class="border-b border-[#f0e9f8] last:border-0 dark:border-[#3f3760]"
          >
            <td class="px-4 py-3">
              <span
                class="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                :class="rankClass(row.rank)"
              >
                {{ row.rank }}
              </span>
            </td>
            <td class="px-4 py-3">
              <PlayerBadge :player="store.playerById(row.playerId)" />
            </td>
            <td class="px-4 py-3">{{ row.played }}</td>
            <td class="px-4 py-3">{{ row.wins }}</td>
            <td class="px-4 py-3">{{ row.losses }}</td>
            <td class="px-4 py-3 font-bold">{{ row.points }}</td>
            <td class="px-4 py-3">{{ row.setDiff > 0 ? `+${row.setDiff}` : row.setDiff }}</td>
            <td class="px-4 py-3">{{ row.strokeDiff > 0 ? `+${row.strokeDiff}` : row.strokeDiff }}</td>
            <td class="px-4 py-3">
              <span
                v-if="complete && row.rank <= 2"
                class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              >
                🏆 晋级
              </span>
              <span
                v-else-if="row.needsDraw"
                class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
              >
                待抽签
              </span>
              <span v-else class="text-xs text-gray-400">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <div class="lg:hidden">
        <div
          v-for="row in rows"
          :key="row.playerId"
          class="flex items-center gap-3 border-b border-[#f0e9f8] p-4 last:border-0 dark:border-[#3f3760]"
        >
          <span
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            :class="rankClass(row.rank)"
          >
            {{ row.rank }}
          </span>
          <PlayerBadge :player="store.playerById(row.playerId)" size="sm" />
          <div class="ml-auto shrink-0 text-right">
            <div class="text-sm font-bold">{{ row.points }} 分</div>
            <div class="text-xs text-gray-400">
              胜{{ row.wins }} 负{{ row.losses }} · 杆{{
                row.strokeDiff > 0 ? `+${row.strokeDiff}` : row.strokeDiff
              }}
            </div>
            <span
              v-if="complete && row.rank <= 2"
              class="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              🏆 晋级
            </span>
            <span
              v-else-if="row.needsDraw"
              class="text-xs font-semibold text-amber-600 dark:text-amber-400"
            >
              待抽签
            </span>
          </div>
        </div>
        <div v-if="!rows.length" class="p-6 text-center text-sm text-gray-400">暂无数据</div>
      </div>
    </div>

    <div v-if="hasDraw" class="mt-3 flex flex-wrap items-center gap-3">
      <p class="text-sm text-amber-700 dark:text-amber-400">
        按规则顺序（积分 → 相互战绩 → 净胜局 → 净胜杆）仍无法区分，需由主办方随机抽签。
      </p>
      <BaseButton
        v-if="auth.isAdmin"
        :icon="mdiDiceMultiple"
        label="发起随机抽签"
        color="warning"
        small
        @click="resolveDraw"
      />
    </div>
  </div>
</template>
