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
          <a-input
            v-model:value="formState.userAccount"
            placeholder="请输入账号"
            size="large"
          >
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
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            class="register-btn"
          >
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
  background-color: #f0f2f5;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  transition: all 0.3s ease;
}

.register-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  color: #1890ff;
  margin-bottom: 8px;
  font-weight: 600;
}

.desc {
  color: #666;
  font-size: 14px;
}

.register-form .ant-form-item {
  margin-bottom: 20px;
}

.register-btn {
  width: 100%;
  height: 40px;
  font-weight: 500;
  margin-top: 10px;
}

.footer {
  text-align: center;
  margin-top: 16px;
}

.tips {
  color: #666;
  font-size: 14px;
}

.login-link {
  color: #1890ff;
  font-weight: 500;
  margin-left: 4px;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px;
  }
}
</style>
