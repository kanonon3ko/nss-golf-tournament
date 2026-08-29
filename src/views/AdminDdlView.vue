<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import PlayerBadge from '@/components/PlayerBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiClipboardText } from '@mdi/js'

const store = useTournamentStore()

const localDdl = reactive({})

onMounted(() => {
  for (const d of store.ddlRounds) {
    localDdl[d.key] = d.ddl ? d.ddl.slice(0, 16) : ''
  }
})

function saveDdl(key) {
  store.setDdl(key, localDdl[key] ? new Date(localDdl[key]).toISOString() : null)
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

const copied = ref('')

function buildNotice() {
  const lines = []
  const pending = store.matches.filter((m) => m.status === 'pending')
  const rounds = store.ddlRounds.filter((d) => d.ddl)
  for (const d of rounds) {
    const num = pending.filter((m) => {
      if (d.stage === 'group') return m.stage === 'group' && m.round === d.round
      return m.stage === d.stage
    }).length
    lines.push(`【${d.label}】DDL：${new Date(d.ddl).toLocaleString('zh-CN')} · 未完成 ${num} 场`)
  }
  if (pending.length) {
    lines.push('')
    lines.push('未完成比赛：')
    for (const m of pending) {
      lines.push(`- ${store.playerName(m.playerAId)} vs ${store.playerName(m.playerBId)}`)
    }
  }
  return lines.join('\n')
}

async function copyNotice() {
  const text = buildNotice()
  try {
    await navigator.clipboard.writeText(text)
    copied.value = '已复制，可直接粘贴到比赛群'
  } catch {
    copied.value = '复制失败，请手动复制'
  }
  setTimeout(() => (copied.value = ''), 3000)
}
</script>

<template>
  <div class="p-6 xl:mx-auto xl:max-w-6xl">
    <div class="mb-5">
      <h1 class="text-2xl font-bold">DDL 与逾期</h1>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        每轮截止时间 · 逾期自动标记 · 组织方裁决
      </p>
    </div>

    <div class="mb-6 overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-slate-900/70">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700 dark:text-slate-400">
            <th class="px-4 py-3">轮次</th>
            <th class="px-4 py-3">DDL</th>
            <th class="px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in store.ddlRounds"
            :key="d.key"
            class="border-b border-gray-100 last:border-0 dark:border-slate-800"
          >
            <td class="px-4 py-3 font-semibold">{{ d.label }}</td>
            <td class="px-4 py-3">
              <input
                v-model="localDdl[d.key]"
                type="datetime-local"
                class="rounded-sm border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              />
            </td>
            <td class="px-4 py-3 text-right">
              <BaseButton label="保存" color="info" small @click="saveDdl(d.key)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mb-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900/70">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm font-bold text-gray-500 dark:text-slate-400">
          逾期待裁决（{{ store.overdueMatches.length }}）
        </span>
        <BaseButton :icon="mdiClipboardText" label="生成群通知文案" color="whiteDark" small @click="copyNotice" />
      </div>
      <p v-if="copied" class="mb-2 text-sm text-emerald-600">{{ copied }}</p>
      <div v-if="store.overdueMatches.length" class="flex flex-col gap-2">
        <div
          v-for="{ match } in store.overdueMatches"
          :key="match.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-900/10"
        >
          <div class="flex items-center gap-2">
            <PlayerBadge :player="store.playerById(match.playerAId)" />
            <span class="text-gray-400">vs</span>
            <PlayerBadge :player="store.playerById(match.playerBId)" />
          </div>
          <div class="flex flex-wrap gap-1">
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
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-400">暂无逾期比赛</p>
    </div>

    <details class="rounded-2xl bg-white p-5 text-sm shadow-sm dark:bg-slate-900/70">
      <summary class="cursor-pointer font-bold">预览通知文案</summary>
      <pre class="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-xs dark:bg-slate-800">{{ buildNotice() }}</pre>
    </details>
  </div>
</template>
