<template>
  <div id="userRegisterPage">
    <div class="register-card">
      <div class="header">
        <h2 class="title">龙龙云图库</h2>
        <div class="desc">企业级智能协同云图库</div>
      </div>

      <a-form
        :model="formState"
        name="basic"
        label-align="left"
        autocomplete="off"
        @finish="handleSubmit"
        class="register-form"
      >
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large">
            <template #prefix>
              <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码不能小于 8 位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          name="checkPassword"
          :rules="[
            { required: true, message: '请输入确认密码' },
            { min: 8, message: '确认密码不能小于 8 位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.checkPassword"
            placeholder="请输入确认密码"
            size="large"
          >
            <template #prefix>
              <SafetyOutlined style="color: rgba(0, 0, 0, 0.25)" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" class="register-btn">
            注册
          </a-button>
        </a-form-item>

        <div class="footer">
          <span class="tips">
            已有账号？
            <RouterLink to="/user/login" class="login-link">去登录</RouterLink>
          </span>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userRegisterUsingPost } from '@/api/userController.ts'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons-vue'

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})
const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 判断两次输入的密码是否一致
  if (formState.userPassword !== formState.checkPassword) {
    message.error('二次输入的密码不一致')
    return
  }
  const res = await userRegisterUsingPost(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}
</script>

<style scoped>
#userRegisterPage {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  animation: bgMove 10s ease-in-out infinite alternate;
  padding: 20px;
}
@keyframes bgMove {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}
.register-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.24);
  padding: 48px 36px 32px 36px;
  width: 100%;
  max-width: 420px;
  transition: box-shadow 0.3s;
}
.register-card:hover {
  box-shadow: 0 12px 32px 0 rgba(31, 38, 135, 0.22);
}
.header {
  text-align: center;
  margin-bottom: 32px;
}
.title {
  font-size: 30px;
  color: #1890ff;
  margin-bottom: 6px;
  font-weight: 800;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
}
.desc {
  color: #888;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 1px;
}
.register-form .ant-form-item {
  margin-bottom: 22px;
}
.register-form .ant-input-affix-wrapper,
.register-form .ant-input-password {
  border-radius: 8px;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}
.register-form .ant-input-affix-wrapper:focus-within,
.register-form .ant-input-password:focus-within {
  box-shadow: 0 0 0 2px #bae7ff;
  border-color: #40a9ff;
}
.register-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
  margin-top: 10px;
  border-radius: 8px;
  background: linear-gradient(90deg, #1890ff 0%, #66e0ff 100%);
  border: none;
  transition:
    background 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
}
.register-btn:hover {
  background: linear-gradient(90deg, #66e0ff 0%, #1890ff 100%);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.16);
}
.footer {
  text-align: center;
  margin-top: 18px;
}
.tips {
  color: #888;
  font-size: 15px;
  font-weight: 400;
}
.login-link {
  color: #ff7875;
  font-weight: 600;
  margin-left: 4px;
  transition: color 0.2s;
}
.login-link:hover {
  color: #ff4d4f;
  text-decoration: underline;
}
@media (max-width: 480px) {
  .register-card {
    padding: 18px 8px 16px 8px;
  }
  .title {
    font-size: 22px;
  }
}
</style>
