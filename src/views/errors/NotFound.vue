<template>
  <div class="not-found">
    <div class="container">
      <h1>404</h1>
      <p>Page not found</p>
      <router-link to="/" class="btn">Go Home</router-link>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'NotFound',
  meta: {
    title: 'Page Not Found'
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  text-align: center;
}

h1 {
  font-size: 72px;
  margin: 0;
  color: #333;
}

p {
  font-size: 18px;
  color: #666;
  margin: 20px 0;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background: #0066cc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 20px;
}

.btn:hover {
  background: #0052a3;
}
</style>
