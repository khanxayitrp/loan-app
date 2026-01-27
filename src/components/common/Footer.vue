<template>

  <div class="w-full">
    <footer class="footer text-bg-neutral items-center px-6 py-4">
      <aside class="grid-flow-col items-center">
        <p>&copy;2026 <a class="link link-hover  text-amber-50 font-medium" href="#">ອິນຊີ HUB</a></p>
      </aside>
      <nav class="text-neutral-content grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a class="link link-hover text-amber-50" href="#">License</a>
        <a class="link link-hover text-amber-50" href="#">Help</a>
        <a class="link link-hover text-amber-50" href="#">Contact</a>
        <a class="link link-hover text-amber-50" href="#">Policy</a>
      </nav>
    </footer>
  </div>


</template>

<script setup lang="ts">
// ไม่ต้องมี logic เพิ่มสำหรับ sticky footer แบบนี้ (ใช้ CSS + flex เท่านั้น)
</script>

<style scoped>
/* Optional: เพิ่มความสวยงามและ transition */
footer {
  transition: all 0.3s ease;
}
</style>
