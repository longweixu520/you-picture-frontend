import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import '@/access'


const app = createApp(App)

app.use(createPinia())
app.use(router)
// ant design vue 全局注册组建 Antd
app.use(Antd)

app.mount('#app')


