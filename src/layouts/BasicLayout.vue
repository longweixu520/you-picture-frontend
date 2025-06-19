<template>
  <div id="basicLayout">
    <a-layout
      style="min-height: 100vh; display: flex; flex-direction: column; background: transparent"
    >
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <a-layout-content
        class="content"
        style="
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0;
          background: transparent;
        "
      >
        <router-view />
      </a-layout-content>

      <a-layout-footer class="footer">
        <div class="footer-content-simple">
          <span>© 2024 龙龙云图库</span>
          <span class="footer-divider">|</span>
          <span>By 宁巧玲的好龙龙</span>
          <span class="footer-divider">|</span>
          <a href="https://github.com/" target="_blank">GitHub</a>
          <span class="footer-divider">|</span>
          <a href="https://www.codefather.cn" target="_blank">编程导航</a>
        </div>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<style scoped>
#basicLayout .header {
  padding-inline-start: 20px;
  background: white;
  color: unset;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

#basicLayout .content {
  padding: 0;
  background: transparent;
  margin-bottom: 0;
  flex: 1;
  width: 100vw;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

#basicLayout .footer {
  background: #f6f8fa;
  padding: 8px 0 4px 0;
  border-radius: 0 0 12px 12px;
  box-shadow: none;
  min-height: 36px;
}

.footer-content-simple {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  color: #888;
  min-height: 36px;
}

.footer-divider {
  color: #ccc;
  margin: 0 4px;
}

.footer-links {
  margin-top: 8px;
  color: #888;
  font-size: 14px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.footer-links a {
  color: #1677ff;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #0958d9;
}
</style>
