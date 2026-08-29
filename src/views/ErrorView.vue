<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-[#ede2f6] px-4 dark:bg-linear-to-br dark:from-[#7d6ba8] dark:to-[#2a2440] dark:text-slate-100">
    <p class="text-6xl font-bold text-gray-300 dark:text-slate-600">404</p>
    <h1 class="mt-2 text-xl font-bold">页面不存在</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">你访问的页面不存在或已被移除。</p>
    <RouterLink to="/" class="mt-6 rounded-full bg-[#7e57c2] px-6 py-2 text-white">
      返回首页
    </RouterLink>
  </div>
</template>
