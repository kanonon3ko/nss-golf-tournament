-- 鬼吃鱼高尔夫锦标赛 · Supabase 建表与权限
-- 在 Supabase Dashboard → SQL Editor 中执行（可重复执行，幂等）

-- 赛事数据（整体存取，体量小，便于前端原子读写）
create table if not exists public.tournament_state (
  key text primary key,
  value jsonb not null
);

-- ============ 角色授权（关键：手建表必须手动 GRANT）============
grant select on public.tournament_state to anon;
grant all on public.tournament_state to authenticated;
grant all on public.tournament_state to service_role;

-- ============ 行级安全 ============
alter table public.tournament_state enable row level security;

-- 所有人可读（赛事数据公开）
drop policy if exists public_read_tournament_state on public.tournament_state;
create policy "public_read_tournament_state"
  on public.tournament_state
  for select
  using (true);

-- 仅登录用户可写（配合关闭公开注册，实际只有管理员能写）
drop policy if exists admin_write_tournament_state on public.tournament_state;
create policy "admin_write_tournament_state"
  on public.tournament_state
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 说明：
-- 1. 执行后匿名访客可读、不可写。
-- 2. 管理员账号请在 Dashboard → Authentication → Users → Add user 创建
--    （邮箱随意，如 admin@nss.local；密码建议与管理口令一致；勾选 Auto Confirm User）。
-- 3. 建议在 Authentication → Providers → Email 关闭 "Allow new users to sign up"，
--    防止别人注册后也能写入。
