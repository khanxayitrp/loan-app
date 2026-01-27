<template>
  <div class="app-container">
    <navbar />
    <div class="main-content">
      <sidebar />
      <div class="unauthorized-container">
        <div class="error-content">
          <h1>401</h1>
          <h2>Unauthorized</h2>
          <p>You don't have permission to access this resource.</p>
          <router-link to="/" class="btn-home">Go Home</router-link>
        </div>
      </div>
    </div>
    <footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Navbar from '@/components/common/Navbar.vue'
import Sidebar from '@/components/common/Sidebar.vue'
import Footer from '@/components/common/Footer.vue'

export default defineComponent({
  name: 'UnauthorizedError',
  components: {
    Navbar,
    Sidebar,
    Footer
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
}

.unauthorized-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-content {
  text-align: center;
  color: white;
}

.error-content h1 {
  font-size: 5rem;
  margin: 0;
}

.error-content h2 {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.error-content p {
  font-size: 1.1rem;
  margin: 1rem 0 2rem;
}

.btn-home {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: transform 0.2s;
}

.btn-home:hover {
  transform: scale(1.05);
}
</style>
