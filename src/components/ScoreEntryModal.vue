<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import BaseModal from '@/components/BaseModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import PlayerBadge from '@/components/PlayerBadge.vue'

const props = defineProps({
  match: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'saved'])

const store = useTournamentStore()

const isBO5 = props.match.stage !== 'group'
const need = isBO5 ? 3 : 2

const form = reactive({
  sets: props.match.sets.map((s) => ({ a: s.a, b: s.b, sdWinner: s.sdWinner })),
  resultLinks: [...(props.match.resultLinks || [])],
  hasDisconnect: !!props.match.disconnect,
  disconnect: props.match.disconnect
    ? { ...props.match.disconnect, links: [...(props.match.disconnect.links || [])] }
    : { setIndex: 0, holesCompleted: 0, note: '', links: [] },
})

const newLink = ref('')

// 只有该局平分（a === b）才允许选择 SD 胜者；不平分时自动清空
watch(
  () => form.sets.map((set) => `${set.a}:${set.b}`),
  () => {
    for (const set of form.sets) {
      const tied = set.a != null && set.b != null && set.a === set.b
      if (!tied) set.sdWinner = null
    }
  },
)
const newDisconnectLink = ref('')
const error = ref('')
const success = ref('')

const playerA = computed(() => store.playerById(props.match.playerAId))
const playerB = computed(() => store.playerById(props.match.playerBId))

const winsPreview = computed(() => {
  const wins = { A: 0, B: 0 }
  for (const set of form.sets) {
    if (set.a == null || set.b == null) continue
    if (set.a < set.b) wins.A += 1
    else if (set.b < set.a) wins.B += 1
    else if (set.sdWinner) {
      if (set.sdWinner === props.match.playerAId) wins.A += 1
      else wins.B += 1
    }
  }
  return wins
})

const winnerPreview = computed(() => {
  if (winsPreview.value.A >= need) return props.match.playerAId
  if (winsPreview.value.B >= need) return props.match.playerBId
  return null
})

const pointsPreview = computed(() => {
  if (props.match.stage !== 'group') return ''
  const w = winnerPreview.value
  if (!w) return ''
  return `${store.playerName(w)} 得 2 分，对手得 1 分`
})

function addLink() {
  const value = newLink.value.trim()
  if (value) {
    form.resultLinks.push(value)
    newLink.value = ''
  }
}

function removeLink(index) {
  form.resultLinks.splice(index, 1)
}

function addDisconnectLink() {
  const value = newDisconnectLink.value.trim()
  if (value) {
    form.disconnect.links.push(value)
    newDisconnectLink.value = ''
  }
}

function removeDisconnectLink(index) {
  form.disconnect.links.splice(index, 1)
}

function save() {
  error.value = ''
  success.value = ''

  if (!winnerPreview.value) {
    error.value = `比分尚未决出胜负：${isBO5 ? '五局三胜' : '三局两胜'}，先得 ${need} 局者胜`
    return
  }

  for (const [index, set] of form.sets.entries()) {
    if (set.a != null && set.b != null && set.a === set.b && !set.sdWinner) {
      error.value = `第 ${index + 1} 局杆数相同，请选择 SD 胜者`
      return
    }
  }

  const result = store.saveMatch(props.match.id, {
    sets: form.sets,
    resultLinks: form.resultLinks,
    disconnect: form.hasDisconnect ? form.disconnect : null,
  })

  if (result && result.ok === false) {
    error.value = result.message
    return
  }

  success.value = '已保存并发布'
  emit('saved')
}
</script>

<template>
  <BaseModal
    :title="`录入赛果 · ${store.playerName(match.playerAId)} vs ${store.playerName(match.playerBId)}`"
    width="max-w-3xl"
    @close="emit('close')"
  >
    <div class="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
      <span>
        {{
          match.stage === 'group'
            ? `${match.groupId}组 · 第${match.round}轮`
            : store.STAGE_LABELS[match.stage]
        }}
      </span>
      <span>{{ isBO5 ? '五局三胜（BO5）' : '三局两胜（BO3）' }}</span>
      <span>DDL：{{ store.ddlForMatch(match) || '未设置' }}</span>
    </div>

    <div
      class="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl bg-[#f4eefa] p-4 dark:bg-[#3c3459]"
    >
      <PlayerBadge :player="playerA" />
      <span class="text-xl font-bold">{{ winsPreview.A }} : {{ winsPreview.B }}</span>
      <div class="justify-self-end">
        <PlayerBadge :player="playerB" />
      </div>
    </div>

    <h4 class="mb-2 text-sm font-bold text-gray-500 dark:text-slate-400">
      各局成绩（相对标准杆，如 -14）
    </h4>
    <div class="mb-4 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[#e7ddf3] text-left text-xs text-gray-500 dark:border-[#4b4270] dark:text-slate-400">
            <th class="py-2 pr-2">局</th>
            <th class="py-2 pr-2">{{ playerA?.name || '甲' }} 相对标准杆</th>
            <th class="py-2 pr-2">{{ playerB?.name || '乙' }} 相对标准杆</th>
            <th class="py-2">平局 SD 胜者</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(set, index) in form.sets"
            :key="index"
            class="border-b border-[#f0e9f8] dark:border-[#3f3760]"
          >
            <td data-label="局" class="py-2 pr-2 font-semibold">{{ index + 1 }}</td>
            <td :data-label="`${playerA?.name || '甲'} 相对标准杆`" class="py-2 pr-2">
              <input
                v-model.number="set.a"
                type="number"
                placeholder="如 -14"
                class="w-24 rounded-sm border border-[#d9cdeb] px-2 py-1.5 dark:border-[#5a507f] dark:bg-[#3c3459]"
              />
            </td>
            <td :data-label="`${playerB?.name || '乙'} 相对标准杆`" class="py-2 pr-2">
              <input
                v-model.number="set.b"
                type="number"
                placeholder="如 -12"
                class="w-24 rounded-sm border border-[#d9cdeb] px-2 py-1.5 dark:border-[#5a507f] dark:bg-[#3c3459]"
              />
            </td>
            <td data-label="平局 SD 胜者" class="py-2">
              <select
                v-model="set.sdWinner"
                :disabled="!(set.a != null && set.b != null && set.a === set.b)"
                class="w-32 rounded-sm border border-[#d9cdeb] px-2 py-1.5 pr-7 dark:border-[#5a507f] dark:bg-[#3c3459] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option :value="null">无（非平局）</option>
                <option :value="match.playerAId">{{ playerA?.name }}</option>
                <option :value="match.playerBId">{{ playerB?.name }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4 class="mb-2 text-sm font-bold text-gray-500 dark:text-slate-400">结果截图链接</h4>
    <div class="mb-4">
      <div class="mb-2 flex flex-wrap gap-2">
        <input
          v-model="newLink"
          type="url"
          placeholder="https://...（截图或录屏链接）"
          class="flex-1 rounded-sm border border-[#d9cdeb] px-3 py-2 dark:border-[#5a507f] dark:bg-[#3c3459]"
        />
        <BaseButton label="添加" color="whiteDark" small @click="addLink" />
      </div>
      <div v-if="form.resultLinks.length" class="flex flex-col gap-1">
        <div
          v-for="(link, i) in form.resultLinks"
          :key="i"
          class="flex items-center justify-between gap-2 rounded bg-[#f4eefa] px-3 py-1.5 text-sm dark:bg-[#3c3459]"
        >
          <span class="truncate text-blue-500">{{ link }}</span>
          <button type="button" class="text-red-500" @click="removeLink(i)">移除</button>
        </div>
      </div>
    </div>

    <h4 class="mb-2 text-sm font-bold text-gray-500 dark:text-slate-400">
      掉线登记
      <label class="ms-2 font-normal">
        <input v-model="form.hasDisconnect" type="checkbox" class="me-1" />
        本场有掉线情况
      </label>
    </h4>
    <div
      v-if="form.hasDisconnect"
      class="mb-4 rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20"
    >
      <div class="mb-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-semibold">掉线发生局</label>
          <select
            v-model.number="form.disconnect.setIndex"
            class="w-full rounded-sm border border-[#d9cdeb] px-2 py-1.5 pr-8 dark:border-[#5a507f] dark:bg-[#3c3459]"
          >
            <option v-for="(set, i) in form.sets" :key="i" :value="i">
              第 {{ i + 1 }} 局
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold">已完成洞数（掉线当洞不计）</label>
          <input
            v-model.number="form.disconnect.holesCompleted"
            type="number"
            min="0"
            max="9"
            class="w-full rounded-sm border border-[#d9cdeb] px-2 py-1.5 pr-8 dark:border-[#5a507f] dark:bg-[#3c3459]"
          />
        </div>
      </div>
      <p class="mb-2 text-xs text-amber-700 dark:text-amber-400">
        剩余需重赛洞数：{{ 9 - (form.disconnect.holesCompleted || 0) }}（结果合并计算）
      </p>
      <textarea
        v-model="form.disconnect.note"
        placeholder="掉线情况说明"
        class="mb-2 w-full rounded-sm border border-[#d9cdeb] px-3 py-2 text-sm dark:border-[#5a507f] dark:bg-[#3c3459]"
      ></textarea>
      <div class="flex gap-2">
        <input
          v-model="newDisconnectLink"
          type="url"
          placeholder="掉线截图/录屏链接"
          class="flex-1 rounded-sm border border-[#d9cdeb] px-3 py-2 dark:border-[#5a507f] dark:bg-[#3c3459]"
        />
        <BaseButton label="添加" color="whiteDark" small @click="addDisconnectLink" />
      </div>
      <div v-if="form.disconnect.links.length" class="mt-2 flex flex-col gap-1">
        <div
          v-for="(link, i) in form.disconnect.links"
          :key="i"
          class="flex items-center justify-between gap-2 rounded bg-[#faf7fd] px-3 py-1.5 text-sm dark:bg-[#3c3459]"
        >
          <span class="truncate text-blue-500">{{ link }}</span>
          <button type="button" class="text-red-500" @click="removeDisconnectLink(i)">移除</button>
        </div>
      </div>
    </div>

    <div
      class="mb-4 rounded-xl bg-emerald-50 p-4 text-sm dark:bg-emerald-900/20"
    >
      <p class="font-semibold text-emerald-700 dark:text-emerald-400">
        判定预览：
        <template v-if="winnerPreview">
          {{ store.playerName(winnerPreview) }} 以 {{ winsPreview.A }} : {{ winsPreview.B }} 获胜
          <span v-if="pointsPreview"> · {{ pointsPreview }}</span>
        </template>
        <span v-else>尚未决出胜负（先得 {{ need }} 局者胜）</span>
      </p>
    </div>

    <p v-if="error" class="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30">
      {{ error }}
    </p>
    <p v-if="success" class="mb-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-900/30">
      {{ success }}
    </p>

    <template #footer>
      <BaseButton label="取消" color="whiteDark" @click="emit('close')" />
      <BaseButton label="保存并发布" color="purple" @click="save" />
    </template>
  </BaseModal>
</template>
