<script setup>
import { computed, reactive, ref } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import { GROUPS } from '@/stores/tournament'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import PlayerBadge from '@/components/PlayerBadge.vue'
import {
  mdiAccountPlus,
  mdiDiceMultiple,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiRestore,
  mdiPencil,
  mdiDelete,
} from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'
import { formatDateTime } from '@/utils/format'

const store = useTournamentStore()

const showEditor = ref(false)
const editingId = ref(null)
const form = reactive({
  name: '',
  bestScore: null,
  tier: 4,
})

function openAdd() {
  editingId.value = null
  form.name = ''
  form.bestScore = null
  form.tier = 4
  showEditor.value = true
}

function openEdit(player) {
  editingId.value = player.id
  form.name = player.name
  form.bestScore = player.bestScore
  form.tier = player.tier
  showEditor.value = true
}

function savePlayer() {
  if (!form.name.trim()) {
    window.alert('请填写选手名字')
    return
  }
  if (editingId.value) {
    store.updatePlayer(editingId.value, {
      name: form.name,
      bestScore: form.bestScore,
      tier: Number(form.tier),
    })
  } else {
    store.addPlayer({
      name: form.name,
      bestScore: form.bestScore,
      tier: Number(form.tier),
    })
  }
  showEditor.value = false
}

function removePlayer(player) {
  if (!window.confirm(`确认删除选手「${player.name}」？`)) return
  const ok = store.removePlayer(player.id)
  if (!ok) window.alert('该选手已有关联比赛记录，无法删除，可改为停用')
}

function doDraw() {
  if (!window.confirm('将清空当前分组并重新随机分配，确定继续？')) return
  store.drawGroups()
}

function doPublish() {
  if (!window.confirm('确认发布分组？发布后将生成全部小组赛赛程，且无法直接重抽。')) return
  const ok = store.publishGroups()
  if (!ok) window.alert('当前分组不满足约束（每组 4 人、每档各 1 人）')
}

function doReset() {
  if (!window.confirm('确认重置赛事？将清空全部赛程、赛果与证据（保留选手名单）。')) return
  store.resetTournament()
}

const tierPlayers = computed(() => {
  const map = {}
  for (const t of [1, 2, 3, 4]) {
    map[t] = store.players.filter((p) => p.tier === t)
  }
  return map
})

function byTierScoreId(a, b) {
  if (a.tier !== b.tier) return a.tier - b.tier
  const sa = a.bestScore ?? Infinity
  const sb = b.bestScore ?? Infinity
  if (sa !== sb) return sa - sb
  return String(a.id).localeCompare(String(b.id))
}

const sortedPlayers = computed(() => [...store.players].sort(byTierScoreId))

function playersOfTier(tier) {
  return store.players.filter((p) => p.tier === tier).sort(byTierScoreId)
}

function slotPlayerId(groupId, tierIndex) {
  return store.draft?.[groupId]?.[tierIndex] || ''
}

function isPlayerUsedElsewhere(playerId, groupId) {
  const d = store.draft
  if (!d) return false
  return GROUPS.some((g) => g !== groupId && (d[g] || []).includes(playerId))
}

function onSlotChange(groupId, tierIndex, event) {
  store.setDraftGroup(groupId, tierIndex, event.target.value || null)
}

function doClearDraft() {
  if (window.confirm('确认清空手动分组选择？所有下拉将回到「未选择」。')) {
    store.clearDraft()
  }
}

const valid = computed(() => store.constraintValid())
const published = computed(() => store.players.some((p) => p.groupId))

function tierClass(tier) {
  const map = {
    1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    3: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    4: 'bg-[#e6dcf3] text-slate-700 dark:bg-[#463e68] dark:text-slate-300',
  }
  return map[tier] || ''
}
</script>

<template>
  <div class="p-6 xl:mx-auto xl:max-w-screen-2xl">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">选手与分组</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ store.players.length }} 名选手 · 抽签约束：每组 4 人、每档各 1 人
        </p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div class="grid grid-cols-3 gap-2 sm:contents">
          <BaseButton
            :icon="mdiAccountPlus"
            label="添加选手"
            color="purple"
            class="w-full sm:w-auto"
            @click="openAdd"
          />
          <BaseButton
            :icon="mdiDiceMultiple"
            label="随机抽签"
            color="warning"
            class="w-full sm:w-auto"
            :disabled="store.players.length !== 16"
            @click="doDraw"
          />
          <BaseButton
            :icon="mdiRestore"
            label="重置赛事"
            color="danger"
            class="w-full sm:w-auto"
            @click="doReset"
          />
        </div>
        <BaseButton
          v-if="store.draft && !published"
          :icon="mdiCheckCircle"
          label="确认发布分组"
          color="purple"
          class="w-full sm:w-auto"
          :disabled="!valid"
          @click="doPublish"
        />
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80">
        <h2 class="mb-3 font-bold">选手名单</h2>
        <div class="hidden overflow-x-auto lg:block">
          <table class="w-full text-sm">
            <thead class="bg-[#faf7fd] dark:bg-[#2c2648]">
              <tr class="border-b border-[#e7ddf3] text-left text-xs text-gray-500 dark:border-[#4b4270] dark:text-slate-400">
                <th class="py-2 pr-2">选手</th>
                <th class="py-2 pr-2">最佳成绩</th>
                <th class="py-2 pr-2">档位</th>
                <th class="py-2 pr-2">组</th>
                <th class="py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="player in sortedPlayers"
                :key="player.id"
                class="border-b border-[#f0e9f8] last:border-0 dark:border-[#3f3760]"
              >
                <td class="py-2 pr-2"><PlayerBadge :player="player" /></td>
                <td class="py-2 pr-2">{{ player.bestScore ?? '-' }}</td>
                <td class="py-2 pr-2">
                  <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="tierClass(player.tier)">
                    {{ player.tier }}档
                  </span>
                </td>
                <td class="py-2 pr-2">{{ player.groupId || '-' }}</td>
                <td class="py-2 text-right">
                  <button type="button" class="inline-flex h-8 w-8 items-center justify-center text-gray-400 hover:text-emerald-500" title="编辑" @click="openEdit(player)">
                    <BaseIcon :path="mdiPencil" size="16" />
                  </button>
                  <button type="button" class="inline-flex h-8 w-8 items-center justify-center text-gray-400 hover:text-red-500" title="删除" @click="removePlayer(player)">
                    <BaseIcon :path="mdiDelete" size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="divide-y divide-[#f0e9f8] lg:hidden dark:divide-[#3f3760]">
          <div
            v-for="player in sortedPlayers"
            :key="player.id"
            class="flex items-center gap-2 py-3"
          >
            <PlayerBadge :player="player" size="sm" truncate class="min-w-0 flex-1" />
            <div class="shrink-0 text-right text-xs text-gray-500 dark:text-slate-400">
              <div>
                <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="tierClass(player.tier)">
                  {{ player.tier }}档
                </span>
                · {{ player.groupId || '未分组' }}
              </div>
              <div>最佳 {{ player.bestScore ?? '-' }}</div>
            </div>
            <div class="flex shrink-0">
              <button type="button" class="inline-flex h-8 w-8 items-center justify-center text-gray-400 hover:text-emerald-500" title="编辑" @click="openEdit(player)">
                <BaseIcon :path="mdiPencil" size="16" />
              </button>
              <button type="button" class="inline-flex h-8 w-8 items-center justify-center text-gray-400 hover:text-red-500" title="删除" @click="removePlayer(player)">
                <BaseIcon :path="mdiDelete" size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80">
          <h2 class="mb-3 font-bold">档位池</h2>
          <div class="flex flex-col gap-3">
            <div v-for="t in [1, 2, 3, 4]" :key="t" class="flex items-start gap-3">
              <span
                class="mt-1 w-10 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-bold"
                :class="tierClass(t)"
              >
                {{ t }}档
              </span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="p in tierPlayers[t]"
                  :key="p.id"
                  class="rounded-full bg-[#eee6f8] px-2.5 py-1 text-xs text-gray-600 dark:bg-[#3c3459] dark:text-slate-300"
                >
                  {{ p.name }}
                </span>
                <span v-if="!tierPlayers[t].length" class="text-xs text-gray-400">空</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80">
          <div class="mb-1 flex items-center justify-between">
            <h2 class="font-bold">手动分组</h2>
            <BaseButton
              label="清空手动选择"
              color="whiteDark"
              small
              @click="doClearDraft"
            />
          </div>
          <p class="mb-3 text-xs text-gray-400">
            默认全部为「未选择」；为每个小组的 1-4 档各选一名选手，同一选手不会重复出现在两组，四组都选满后才能发布。
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="g in GROUPS"
              :key="g"
              class="rounded-xl bg-[#f4eefa] p-3 dark:bg-[#3c3459]"
            >
              <p class="mb-2 text-sm font-bold text-gray-500 dark:text-slate-400">{{ g }}组</p>
              <div v-for="t in [1, 2, 3, 4]" :key="t" class="mb-2 last:mb-0">
                <label class="mb-1 block text-xs text-gray-400">{{ t }}档</label>
                <select
                  :value="slotPlayerId(g, t - 1)"
                  class="w-full rounded-sm border border-[#d9cdeb] px-3 py-2 pr-8 text-sm dark:border-[#5a507f] dark:bg-[#3c3459]"
                  @change="onSlotChange(g, t - 1, $event)"
                >
                  <option value="">未选择</option>
                  <option
                    v-for="p in playersOfTier(t)"
                    :key="p.id"
                    :value="p.id"
                    :disabled="isPlayerUsedElsewhere(p.id, g)"
                  >
                    {{ p.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-bold">抽签分组</h2>
            <span
              class="rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="valid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'"
            >
              {{ valid ? '✅ 满足全部约束' : '未满足约束' }}
            </span>
          </div>
          <p v-if="!store.draft" class="mb-3 text-sm text-gray-400">
            尚未分组：点击「随机抽签」，或在上方「手动分组」里为每组选择选手。
          </p>
          <div v-if="store.draft" class="mb-3 grid gap-2 sm:grid-cols-2">
            <div
              v-for="g in GROUPS"
              :key="g"
              class="rounded-xl bg-[#f4eefa] p-3 text-sm dark:bg-[#3c3459]"
            >
              <p class="mb-1 font-bold text-gray-500 dark:text-slate-400">{{ g }}组</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="id in (store.draft[g] || []).filter(Boolean)"
                  :key="id"
                  class="rounded-full bg-[#faf7fd] px-2 py-0.5 text-xs shadow-sm dark:bg-[#463e68]"
                >
                  {{ store.playerName(id) }}
                </span>
              </div>
            </div>
          </div>
          <div
            v-if="published"
            class="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          >
            <BaseIcon :path="mdiCheckCircle" size="16" />
            分组已发布，赛程已生成。如需重新抽签请先「重置赛事」。
          </div>
          <p v-else class="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <BaseIcon :path="mdiAlertCircle" size="16" />
            分组为草稿状态，需「确认发布分组」后生成赛程。
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="store.drawHistory.length"
      class="mt-6 mb-4 rounded-2xl bg-[#faf7fd] p-5 shadow-sm dark:bg-[#332c54]/80"
    >
      <h2 class="mb-3 font-bold">抽签记录（可验证）</h2>
      <div class="flex flex-col gap-2">
        <div
          v-for="rec in store.drawHistory.slice(0, 5)"
          :key="rec.id"
          class="rounded-xl bg-[#f4eefa] p-3 text-sm dark:bg-[#3c3459]"
        >
          <p class="mb-2 text-xs text-gray-400">
            {{ formatDateTime(rec.time) }} · {{ rec.by }} · {{ rec.id }}
          </p>
          <div class="flex flex-col gap-1 text-xs">
            <p v-for="t in [1, 2, 3, 4]" :key="t">
              {{ t }}档顺序：
              <span class="text-gray-600 dark:text-slate-300">
                {{ (rec.tiers[t] || []).map((id) => store.playerName(id)).join(' → ') }}
              </span>
            </p>
            <p class="mt-1 text-gray-500 dark:text-slate-400">
              分组：
              <span v-for="g in ['A', 'B', 'C', 'D']" :key="g" class="me-2">
                {{ g }}组（{{ (rec.groups[g] || []).map((id) => store.playerName(id)).join('、') }}）
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      v-if="showEditor"
      :title="editingId ? '编辑选手' : '添加选手'"
      width="max-w-md"
      @close="showEditor = false"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="mb-1 block text-sm font-bold">名字</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full rounded-sm border border-[#d9cdeb] px-3 py-2 pr-8 dark:border-[#5a507f] dark:bg-[#3c3459]"
            placeholder="选手昵称"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm font-bold">历史最佳（9洞）</label>
            <input
              v-model.number="form.bestScore"
              type="number"
              min="1"
              class="w-full rounded-sm border border-[#d9cdeb] px-3 py-2 pr-8 dark:border-[#5a507f] dark:bg-[#3c3459]"
              placeholder="杆数"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-bold">档位</label>
            <select
              v-model.number="form.tier"
              class="w-full rounded-sm border border-[#d9cdeb] px-3 py-2 pr-8 dark:border-[#5a507f] dark:bg-[#3c3459]"
            >
              <option :value="1">1档（最强）</option>
              <option :value="2">2档</option>
              <option :value="3">3档</option>
              <option :value="4">4档</option>
            </select>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton label="取消" color="whiteDark" @click="showEditor = false" />
        <BaseButton label="保存" color="purple" @click="savePlayer" />
      </template>
    </BaseModal>
  </div>
</template>
