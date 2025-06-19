<template>
  <div class="user-center-page">
    <div class="user-info-card">
      <a-avatar :src="user.userAvatar" size="large" />
      <div class="user-info-meta">
        <div class="user-name">{{ user.userName || '未登录' }}</div>
        <div class="user-role">角色：{{ user.userRole || '普通用户' }}</div>
        <div class="user-profile">简介：{{ user.userProfile || '暂无简介' }}</div>
      </div>
    </div>
    <div class="user-center-actions">
      <a-button type="primary" @click="goMyPictures">我的图片</a-button>
      <a-button @click="goMyFavorites">我的收藏</a-button>
      <a-button @click="goEditProfile">编辑资料</a-button>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useRouter } from 'vue-router'
const loginUserStore = useLoginUserStore()
const user = loginUserStore.loginUser
const router = useRouter()
const goMyPictures = () => {
  router.push({ path: '/user/center/mypictures' })
}
const goMyFavorites = () => {
  router.push({ path: '/user/center/favorites' })
}
const goEditProfile = () => {
  router.push({ path: '/user/center/edit' })
}
</script>

<style scoped>
.user-center-page {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 32px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-info-card {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}
.user-info-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.user-name {
  font-size: 22px;
  font-weight: 600;
}
.user-role {
  color: #888;
  font-size: 15px;
}
.user-profile {
  color: #666;
  font-size: 15px;
}
.user-center-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
</style>
