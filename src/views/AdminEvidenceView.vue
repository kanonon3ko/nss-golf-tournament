<script setup>
import { computed, reactive, ref } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import { formatDateTime } from '@/utils/format'
import { mdiPlus } from '@mdi/js'

const store = useTournamentStore()

const typeFilter = ref('all')
const showAdd = ref(false)
const form = reactive({
  matchId: '',
  type: 'result',
  name: '',
  url: '',
})

const typeLabels = {
  result: '赛果截图',
  disconnect: '掉线证据',
  other: '其他',
}

const filtered = computed(() =>
  store.evidence.filter((e) => typeFilter.value === 'all' || e.type === typeFilter.value),
)

function matchLabel(matchId) {
  const match = store.matches.find((m) => m.id === matchId)
  if (!match) return '（未关联）'
  const prefix = match.stage === 'group' ? `${match.groupId}组 ` : ''
  return `${prefix}${store.playerName(match.playerAId)} vs ${store.playerName(match.playerBId)}`
}

function save() {
  if (!form.url.trim()) {
    window.alert('请填写证据链接')
    return
  }
  store.addEvidence({
    matchId: form.matchId || null,
    type: form.type,
    name: form.name,
    url: form.url,
  })
  showAdd.value = false
  form.matchId = ''
  form.type = 'result'
  form.name = ''
  form.url = ''
}

function remove(id) {
  if (window.confirm('确认删除该证据？')) {
    store.removeEvidence(id)
  }
}
</script>

<template>
  <div class="p-6 xl:mx-auto xl:max-w-6xl">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">证据与日志</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400">赛果截图 / 掉线证据统一留档 · 操作日志可追溯</p>
      </div>
      <BaseButton :icon="mdiPlus" label="添加证据" color="info" @click="showAdd = true" />
    </div>

    <div class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="(label, value) in { all: '全部', ...typeLabels }"
        :key="value"
        type="button"
        class="rounded-full px-3 py-1.5 text-sm"
        :class="
          typeFilter === value
            ? 'bg-slate-800 font-semibold text-white dark:bg-slate-200 dark:text-slate-900'
            : 'bg-white text-gray-600 shadow-sm dark:bg-slate-900 dark:text-slate-300'
        "
        @click="typeFilter = value"
      >
        {{ label }}
      </button>
    </div>

    <div class="mb-6 overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-slate-900/70">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-slate-700 dark:text-slate-400">
            <th class="px-4 py-3">名称</th>
            <th class="px-4 py-3">关联比赛</th>
            <th class="px-4 py-3">类型</th>
            <th class="px-4 py-3">链接</th>
            <th class="px-4 py-3">上传人</th>
            <th class="px-4 py-3">时间</th>
            <th class="px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ev in filtered"
            :key="ev.id"
            class="border-b border-gray-100 last:border-0 dark:border-slate-800"
          >
            <td class="px-4 py-3 font-medium">{{ ev.name }}</td>
            <td class="px-4 py-3">{{ matchLabel(ev.matchId) }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="
                  ev.type === 'result'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : ev.type === 'disconnect'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                "
              >
                {{ typeLabels[ev.type] || '其他' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <a
                :href="ev.url"
                target="_blank"
                rel="noopener"
                class="max-w-[200px] truncate text-blue-500 underline"
              >
                {{ ev.url }}
              </a>
            </td>
            <td class="px-4 py-3">{{ ev.by }}</td>
            <td class="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
              {{ formatDateTime(ev.time) }}
            </td>
            <td class="px-4 py-3 text-right">
              <BaseButton label="删除" color="danger" small @click="remove(ev.id)" />
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">暂无证据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900/70">
      <h2 class="mb-3 font-bold">操作日志（最近 30 条）</h2>
      <ul class="flex max-h-72 flex-col gap-1 overflow-y-auto text-sm text-gray-600 dark:text-slate-300">
        <li v-for="log in store.logs.slice(0, 30)" :key="log.id" class="flex gap-2">
          <span class="shrink-0 text-xs text-gray-400">{{ formatDateTime(log.time) }}</span>
          <span class="shrink-0 font-semibold">{{ log.by }}</span>
          <span>{{ log.message }}</span>
        </li>
        <li v-if="!store.logs.length" class="text-gray-400">暂无日志</li>
      </ul>
    </div>

    <BaseModal v-if="showAdd" title="添加证据" width="max-w-md" @close="showAdd = false">
      <div class="flex flex-col gap-4">
        <div>
          <label class="mb-1 block text-sm font-bold">关联比赛</label>
          <select
            v-model="form.matchId"
            class="w-full rounded-sm border border-gray-300 px-3 py-2 pr-8 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">不关联</option>
            <option v-for="m in store.matches" :key="m.id" :value="m.id">
              {{ matchLabel(m.id) }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm font-bold">类型</label>
            <select
              v-model="form.type"
              class="w-full rounded-sm border border-gray-300 px-3 py-2 pr-8 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="result">赛果截图</option>
              <option value="disconnect">掉线证据</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold">名称</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full rounded-sm border border-gray-300 px-3 py-2 pr-8 dark:border-slate-600 dark:bg-slate-800"
              placeholder="选填"
            />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold">链接</label>
          <input
            v-model="form.url"
            type="url"
            class="w-full rounded-sm border border-gray-300 px-3 py-2 pr-8 dark:border-slate-600 dark:bg-slate-800"
            placeholder="https://...（图片 / 录屏链接）"
          />
        </div>
      </div>
      <template #footer>
        <BaseButton label="取消" color="whiteDark" @click="showAdd = false" />
        <BaseButton label="保存" color="info" @click="save" />
      </template>
    </BaseModal>
  </div>
</template>
