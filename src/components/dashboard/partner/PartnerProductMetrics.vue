<template>
  <section>
    <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
      <span class="w-2 h-8 bg-sky-500 rounded-full"></span>
      ພາບລວມສິນຄ້າ ແລະ ຮ້ານຄ້າ
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="metric-card border-t-4 border-sky-500">
        <div class="flex justify-between items-center">
          <span class="text-4xl">🏢</span>
          <div class="text-right">
            <p class="text-slate-500 text-xs font-bold uppercase tracking-tight">ຈຳນວນຮ້ານຄ້າ</p>
            <h3 class="text-3xl font-black mt-1 text-slate-800">124</h3>
          </div>
        </div>
      </div>
      <div class="metric-card border-t-4 border-slate-400">
        <div class="flex justify-between items-center">
          <span class="text-4xl">📝</span>
          <div class="text-right">
            <p class="text-slate-500 text-xs font-bold uppercase tracking-tight">ສິນຄ້າລົງທະບຽນ</p>
            <h3 class="text-3xl font-black mt-1 text-slate-800">1,850</h3>
          </div>
        </div>
      </div>
      <div class="metric-card border-t-4 border-emerald-500">
        <div class="flex justify-between items-center">
          <span class="text-4xl">🔓</span>
          <div class="text-right">
            <p class="text-slate-500 text-xs font-bold uppercase tracking-tight">ເປີດໃຫ້ຂໍສິນເຊື່ອ</p>
            <h3 class="text-3xl font-black mt-1 text-emerald-600">1,420</h3>
          </div>
        </div>
      </div>
      <div class="metric-card border-t-4 border-red-500">
        <div class="flex justify-between items-center">
          <span class="text-4xl">🔒</span>
          <div class="text-right">
            <p class="text-slate-500 text-xs font-bold uppercase tracking-tight">ປິດການຂໍສິນເຊື່ອ</p>
            <h3 class="text-3xl font-black mt-1 text-red-600">430</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metric-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-width: 1px;
  border-top-width: 4px;
  border-color: #e2e8f0;
}
.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #0ea5e9;
}
</style>
