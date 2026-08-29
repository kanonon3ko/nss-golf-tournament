import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LayoutPublic from '@/layouts/LayoutPublic.vue'
import LayoutAdmin from '@/layouts/LayoutAdmin.vue'
import HomeView from '@/views/HomeView.vue'
import GroupsView from '@/views/GroupsView.vue'
import StandingsView from '@/views/StandingsView.vue'
import BracketView from '@/views/BracketView.vue'
import PlayersView from '@/views/PlayersView.vue'
import PlayerProfileView from '@/views/PlayerProfileView.vue'
import RulesView from '@/views/RulesView.vue'
import LoginView from '@/views/LoginView.vue'
import AdminView from '@/views/AdminView.vue'
import AdminPlayersView from '@/views/AdminPlayersView.vue'
import AdminMatchesView from '@/views/AdminMatchesView.vue'
import AdminDdlView from '@/views/AdminDdlView.vue'
import AdminEvidenceView from '@/views/AdminEvidenceView.vue'
import AdminExportView from '@/views/AdminExportView.vue'
import ErrorView from '@/views/ErrorView.vue'

const routes = [
  {
    meta: {
      title: '管理员登录',
    },
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/',
    component: LayoutPublic,
    meta: { title: '首页' },
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
      },
      {
        path: 'groups',
        name: 'groups',
        component: GroupsView,
        meta: { title: '小组赛' },
      },
      {
        path: 'standings',
        name: 'standings',
        component: StandingsView,
        meta: { title: '积分榜' },
      },
      {
        path: 'bracket',
        name: 'bracket',
        component: BracketView,
        meta: { title: '淘汰赛' },
      },
      {
        path: 'players',
        name: 'players',
        component: PlayersView,
        meta: { title: '选手' },
      },
      {
        path: 'players/:id',
        name: 'player',
        component: PlayerProfileView,
        meta: { title: '选手档案' },
      },
      {
        path: 'rules',
        name: 'rules',
        component: RulesView,
        meta: { title: '规则' },
      },
    ],
  },
  {
    path: '/admin',
    component: LayoutAdmin,
    meta: { requiresAdmin: true, title: '管理后台' },
    children: [
      {
        path: '',
        name: 'admin',
        component: AdminView,
        meta: { title: '管理后台' },
      },
      {
        path: 'players',
        name: 'admin-players',
        component: AdminPlayersView,
        meta: { title: '选手与分组' },
      },
      {
        path: 'matches',
        name: 'admin-matches',
        component: AdminMatchesView,
        meta: { title: '赛果录入' },
      },
      {
        path: 'ddl',
        name: 'admin-ddl',
        component: AdminDdlView,
        meta: { title: 'DDL 与逾期' },
      },
      {
        path: 'evidence',
        name: 'admin-evidence',
        component: AdminEvidenceView,
        meta: { title: '证据与日志' },
      },
      {
        path: 'export',
        name: 'admin-export',
        component: AdminExportView,
        meta: { title: '数据导出' },
      },
    ],
  },
  {
    meta: {
      title: '页面不存在',
    },
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: ErrorView,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) {
    await auth.init()
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'login', query: { next: to.fullPath } }
  }
  if (to.name === 'login' && auth.isAdmin) {
    return { name: 'admin' }
  }
  return true
})

export default router
