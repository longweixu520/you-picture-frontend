<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <a-layout-content class="content">
        <router-view />
      </a-layout-content>

      <a-layout-footer class="footer">
        <div class="footer-content">
          <div class="rainbow-text">
            <span class="rainbow-char">龙</span>
            <span class="rainbow-char">龙</span>
            <span class="rainbow-char">云</span>
            <span class="rainbow-char">图</span>
            <span class="rainbow-char">库</span>
            <span> </span>
            <span class="rainbow-char">B</span>
            <span class="rainbow-char">y</span>
            <span> </span>
            <span class="rainbow-char">宁</span>
            <span class="rainbow-char">巧</span>
            <span class="rainbow-char">玲</span>
            <span class="rainbow-char">的</span>
            <span class="rainbow-char">好</span>
            <span class="rainbow-char">龙</span>
            <span class="rainbow-char">龙</span>
          </div>
          <div class="rainbow-text-sub">
            <span class="rainbow-char">龙</span>
            <span class="rainbow-char">哥</span>
            <span class="rainbow-char">哥</span>
            <span class="rainbow-char">最</span>
            <span class="rainbow-char">好</span>
            <span class="rainbow-char">了</span>
          </div>
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
  margin-bottom: 16px;
}

#basicLayout .content {
  padding: 20px;
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
}

#basicLayout .footer {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rainbow-text, .rainbow-text-sub {
  font-size: 16px;
  font-weight: bold;
  margin: 0 auto;
  display: inline-block;
}

.rainbow-char {
  animation: rainbow 3s infinite;
  display: inline-block;
}

.rainbow-text-sub .rainbow-char {
  animation-delay: 0.5s;
}

@keyframes rainbow {
  0% { color: #ff0000; transform: translateY(0); }
  14% { color: #ff7f00; }
  28% { color: #ffff00; transform: translateY(-3px); }
  42% { color: #00ff00; }
  57% { color: #0000ff; transform: translateY(0); }
  71% { color: #4b0082; }
  85% { color: #9400d3; transform: translateY(3px); }
  100% { color: #ff0000; transform: translateY(0); }
}

/* 添加一些悬停效果 */
.rainbow-char:hover {
  animation: rainbow 1s infinite, bounce 0.5s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
