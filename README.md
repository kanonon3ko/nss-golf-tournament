# Nintendo Switch Sports高尔夫锦标赛赛况记录网站

基于《NSS鬼吃鱼高尔夫锦标赛比赛规则》的 16 人高尔夫锦标赛赛况记录网站：从抽签分组、小组赛积分、淘汰赛对阵，到赛果与证据管理，一站完成。主办方口令登录后可编辑，选手与游客只读。

## 功能

**公开端（只读）**
- 首页总览：阶段进度、轮次 DDL、积分榜速览、最近赛果、淘汰赛进度
- 小组赛：A/B/C/D 四组赛程、BO3 比分、SD 标记、逾期高亮
- 积分榜：四组同页展示，按规则自动排序（积分 → 相互战绩 → 净胜局 → 净胜杆 → 主办方抽签）
- 淘汰赛：固定对阵（A1-B2 / C1-D2 / A2-B1 / C2-D1），8 强未确定前只显示预计对位，胜者自动晋级
- 选手：4×4 卡片 + 个人档案（战绩、对局明细）
- 规则：规则九章在线查阅

**管理端（主办方）**
- 选手与分组：名单管理、加密级随机抽签（crypto.getRandomValues）并留可验证记录、约束校验
- 赛果录入：BO3/BO5、相对标准杆记分、平局 SD 胜者、掉线合并登记、截图链接
- DDL 与逾期：每周日 23:59 预设，逾期判负（A负 / B负 / 双方负 / 延期）、群通知文案
- 证据与日志：赛果截图、掉线证据留档，操作日志可追溯
- 数据导出：CSV / JSON / 对阵文本

其他：深色模式、真实选手头像、移动端适配。

## 技术栈

- Vue 3 + Vite + Tailwind CSS 4 + Pinia + vue-router
- Supabase（数据库 + 登录鉴权，RLS 行级安全）
- 界面基础：[Admin One Tailwind Vue 3](https://justboil.me/tailwind-admin-templates/free-vue-dashboard/)（MIT）

## 快速开始

```bash
npm install
npm run dev
```

访问 `http://localhost:5173/`。

- 未配置 Supabase 时自动回退到本地 localStorage，方便离线体验。
- 主办方口令：本地回退模式在 `.env` 的 `VITE_ADMIN_PASSWORD` 里配置（该文件已被 git 忽略，不会提交）；启用 Supabase 后改用 Supabase 主办方账号密码登录。

## Supabase 配置

1. 在 Supabase Dashboard → **SQL Editor** 执行 `supabase/schema.sql`（建表 + RLS：游客只读、登录用户可写）。
2. **Authentication → Users → Add user** 创建主办方账号（勾选 Auto Confirm User）。
3. 建议关闭公开注册：Authentication → Providers → Email → Allow new users to sign up 关掉。
4. 复制 `.env.example` 为 `.env` 填入项目信息（anon key 为公开值，可放心放在前端）。

> 云端首次写入会在主办方登录后自动触发；本地已有数据会同步到云端。

## 数据与重置

- 初始预设：16 名选手（含头像）、按历史最佳分档、**未抽签**，等待主办方抽签发布。
- 主办方后台「选手与分组 → 重置赛事」可清空分组与赛程（保留选手名单）。
- 所有数据实时同步 Supabase，任意设备打开为同一份数据。

## 部署

构建产物：`npm run build` → `dist/`。

推荐 **GitHub（私有仓库）+ Cloudflare Pages**，详细步骤见 [DEPLOY.md](DEPLOY.md)。也支持 Vercel / Netlify / 国内 OSS 静态托管。

## 目录结构

```
src/
├── components/     # 通用组件（对阵树、积分榜、弹窗、头像等）
├── layouts/        # 公开端 / 管理端布局
├── stores/         # Pinia：赛事数据、登录、深色模式
├── lib/            # Supabase 客户端
├── views/          # 页面（公开端 + 管理端）
├── utils/          # 格式化、CSV 工具
├── config.js       # 站点配置与环境变量读取
└── router/         # 路由与权限守卫
supabase/
└── schema.sql      # 建表与权限脚本
```

## 比赛规则

完整规则见《NSS鬼吃鱼高尔夫锦标赛比赛规则》PDF。核心要点：

- 16 人按历史最佳分 4 档，抽签进入 A/B/C/D 组，每组各档 1 人。
- 小组赛：随机 9 洞、BO3，胜 2 分 / 负 1 分，每人 3 场。
- 排名：积分 → 相互战绩 → 净胜局 → 净胜杆 → 主办方抽签。
- 淘汰赛：BO5 先 3 胜，固定对阵，每周 1 场，DDL 由主办方公布。
- 单局 9 洞平局进入突然死亡（SD）：新开一局逐洞比较，先领先者胜。
- 掉线：已完成洞数保留，重赛剩余洞数合并计算，截图/录屏留档。

## License

MIT。界面基础基于 Admin One Tailwind Vue 3（JustBoil.me）。
