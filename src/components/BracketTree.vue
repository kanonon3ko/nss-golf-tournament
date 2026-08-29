<script setup>
import { computed } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import PlayerBadge from '@/components/PlayerBadge.vue'
import MatchStatusPill from '@/components/MatchStatusPill.vue'
import { mdiTrophy } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps({
  nodes: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['open-match'])

const store = useTournamentStore()

const qf = computed(() => props.nodes.filter((n) => n.stage === 'qf').sort((a, b) => a.order - b.order))
const sf = computed(() => props.nodes.filter((n) => n.stage === 'sf').sort((a, b) => a.order - b.order))
const final = computed(() => props.nodes.find((n) => n.stage === 'final'))

function scoreFor(node, side) {
  if (!node.matchId) return '-'
  const match = store.matches.find((m) => m.id === node.matchId)
  if (!match || match.status !== 'complete') return '-'
  const score = store.matchScore(match)
  return side === 'a' ? score.a : score.b
}

function winnerSide(node) {
  if (!node.matchId) return null
  const match = store.matches.find((m) => m.id === node.matchId)
  if (!match) return null
  return match.winnerId === match.playerAId ? 'a' : match.winnerId === match.playerBId ? 'b' : null
}

function playerOf(node, side) {
  return store.playerById(node[side === 'a' ? 'playerAId' : 'playerBId'])
}
</script>

<template>
  <div class="overflow-x-auto pb-4">
    <div class="flex min-w-max items-stretch gap-8">
      <div class="flex flex-col justify-around gap-4">
        <div class="mb-1 text-center text-xs font-bold text-gray-400">八强</div>
        <button
          v-for="node in qf"
          :key="`qf-${node.order}`"
          type="button"
          class="w-64 rounded-2xl bg-[#faf7fd] p-3 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-[#332c54]/80"
          :class="{ 'cursor-pointer': node.matchId, 'cursor-default': !node.matchId }"
          @click="node.matchId && emit('open-match', node.matchId)"
        >
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400">{{ node.label }}</span>
            <MatchStatusPill :status="node.status" />
          </div>
          <div
            class="mb-1 flex items-center justify-between rounded-lg px-2 py-1.5"
            :class="winnerSide(node) === 'a' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''"
          >
            <PlayerBadge v-if="playerOf(node, 'a')" :player="playerOf(node, 'a')" />
            <span v-else class="text-sm text-gray-400">{{ node.expectedA }}</span>
            <span class="font-bold">{{ scoreFor(node, 'a') }}</span>
          </div>
          <div
            class="flex items-center justify-between rounded-lg px-2 py-1.5"
            :class="winnerSide(node) === 'b' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''"
          >
            <PlayerBadge v-if="playerOf(node, 'b')" :player="playerOf(node, 'b')" />
            <span v-else class="text-sm text-gray-400">{{ node.expectedB }}</span>
            <span class="font-bold">{{ scoreFor(node, 'b') }}</span>
          </div>
        </button>
      </div>

      <div class="flex flex-col justify-around gap-4">
        <div class="mb-1 text-center text-xs font-bold text-gray-400">半决赛</div>
        <button
          v-for="node in sf"
          :key="`sf-${node.order}`"
          type="button"
          class="w-64 rounded-2xl bg-[#faf7fd] p-3 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-[#332c54]/80"
          :class="{ 'cursor-pointer': node.matchId, 'cursor-default': !node.matchId }"
          @click="node.matchId && emit('open-match', node.matchId)"
        >
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400">{{ node.label }}</span>
            <MatchStatusPill :status="node.status" />
          </div>
          <div
            class="mb-1 flex items-center justify-between rounded-lg px-2 py-1.5"
            :class="winnerSide(node) === 'a' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''"
          >
            <PlayerBadge v-if="playerOf(node, 'a')" :player="playerOf(node, 'a')" />
            <span v-else class="text-sm text-gray-400">{{ node.expectedA }}</span>
            <span class="font-bold">{{ scoreFor(node, 'a') }}</span>
          </div>
          <div
            class="flex items-center justify-between rounded-lg px-2 py-1.5"
            :class="winnerSide(node) === 'b' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''"
          >
            <PlayerBadge v-if="playerOf(node, 'b')" :player="playerOf(node, 'b')" />
            <span v-else class="text-sm text-gray-400">{{ node.expectedB }}</span>
            <span class="font-bold">{{ scoreFor(node, 'b') }}</span>
          </div>
        </button>
      </div>

      <div class="flex flex-col justify-center">
        <div class="mb-1 text-center text-xs font-bold text-gray-400">决赛</div>
        <button
          v-if="final"
          type="button"
          class="w-64 rounded-2xl bg-[#faf7fd] p-3 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-[#332c54]/80"
          :class="{ 'cursor-pointer': final.matchId, 'cursor-default': !final.matchId }"
          @click="final.matchId && emit('open-match', final.matchId)"
        >
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400">{{ final.label }}</span>
            <MatchStatusPill :status="final.status" />
          </div>
          <div
            class="mb-1 flex items-center justify-between rounded-lg px-2 py-1.5"
            :class="winnerSide(final) === 'a' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''"
          >
            <PlayerBadge v-if="playerOf(final, 'a')" :player="playerOf(final, 'a')" />
            <span v-else class="text-sm text-gray-400">{{ final.expectedA }}</span>
            <span class="font-bold">{{ scoreFor(final, 'a') }}</span>
          </div>
          <div
            class="flex items-center justify-between rounded-lg px-2 py-1.5"
            :class="winnerSide(final) === 'b' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''"
          >
            <PlayerBadge v-if="playerOf(final, 'b')" :player="playerOf(final, 'b')" />
            <span v-else class="text-sm text-gray-400">{{ final.expectedB }}</span>
            <span class="font-bold">{{ scoreFor(final, 'b') }}</span>
          </div>
          <div
            v-if="store.championId"
            class="mt-3 flex items-center justify-center gap-1 rounded-lg bg-yellow-50 py-2 text-sm font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          >
            <BaseIcon :path="mdiTrophy" size="18" />
            {{ store.playerName(store.championId) }} 夺冠
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
