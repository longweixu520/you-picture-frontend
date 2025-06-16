<template>
  <div id="pictureDetailPage">
    <a-spin :spinning="loading">
      <template v-if="error">
        <a-result status="error" title="加载失败" :sub-title="error">
          <template #extra>
            <a-button type="primary" @click="fetchPictureDetail">重试</a-button>
          </template>
        </a-result>
      </template>
      <template v-else-if="!picture || !picture.id">
        <a-result status="404" title="未找到图片" sub-title="图片不存在或已被删除" />
      </template>
      <template v-else>
        <a-row :gutter="[16, 16]">
          <!-- 图片展示区 -->
          <a-col :sm="24" :md="16" :xl="18">
            <a-card title="图片预览">
              <a-image style="max-height: 600px; object-fit: contain" :src="picture.url" />
            </a-card>
          </a-col>
          <!-- 图片信息区 -->
          <a-col :sm="24" :md="8" :xl="6">
            <a-card title="图片信息">
              <a-descriptions :column="1">
                <a-descriptions-item label="作者">
                  <a-space>
                    <a-avatar :size="24" :src="picture.user?.userAvatar" />
                    <div>{{ picture.user?.userName }}</div>
                  </a-space>
                </a-descriptions-item>
                <a-descriptions-item label="名称">
                  {{ picture.name ?? '未命名' }}
                </a-descriptions-item>
                <a-descriptions-item label="简介">
                  {{ picture.introduction ?? '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="分类">
                  {{ picture.category ?? '默认' }}
                </a-descriptions-item>
                <a-descriptions-item label="标签">
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="格式">
                  {{ picture.picFormat ?? '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="宽度">
                  {{ picture.picWidth ?? '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="高度">
                  {{ picture.picHeight ?? '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="宽高比">
                  {{ picture.picScale ?? '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="大小">
                  {{
                    formatSize(
                      !isNaN(Number(picture.picSize)) ? Number(picture.picSize) : undefined,
                    )
                  }}
                </a-descriptions-item>
              </a-descriptions>
              <a-space wrap>
                <a-button type="primary" @click="doDownload">
                  免费下载
                  <template #icon>
                    <DownloadOutlined />
                  </template>
                </a-button>
                <a-button v-if="canEdit" type="default" @click="doEdit">
                  编辑
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-button v-if="canEdit" danger @click="doDelete">
                  删除
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </a-space>
            </a-card>
          </a-col>
        </a-row>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import router from '@/router'
import { useRoute } from 'vue-router'
import { downloadImage } from '@/utils/index'

const props = defineProps<{ id?: string | number }>()
const route = useRoute()

const loading = ref(false)
const error = ref('')
const picture = ref<API.PictureVO | null>(null)

// 获取图片id，优先props，其次route
const getPictureId = () => {
  return props.id ?? route.params.id
}

// 获取图片详情
const fetchPictureDetail = async () => {
  const id = getPictureId()
  if (!id) {
    error.value = '未获取到图片ID'
    picture.value = null
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await getPictureVoByIdUsingGet({ id })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      error.value = '获取图片详情失败，' + res.data.message
      picture.value = null
    }
  } catch (e: any) {
    error.value = '获取图片详情失败：' + (e.message || e)
    picture.value = null
  } finally {
    loading.value = false
  }
}

const loginUserStore = useLoginUserStore()
// 是否具有编辑权限
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) return false
  const user = picture.value?.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
})
// 编辑
const doEdit = () => {
  if (picture.value?.id) {
    router.push('/add_picture?id=' + picture.value.id)
  }
}
// 删除
const doDelete = async () => {
  const id = picture.value?.id
  if (!id) return
  loading.value = true
  try {
    const res = await deletePictureUsingPost({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      router.push('/')
    } else {
      message.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

const doDownload = () => {
  if (picture.value?.url) {
    downloadImage(picture.value.url, picture.value.name || '图片下载')
  }
}

function formatSize(size: number | undefined) {
  if (!size) return '-'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / 1024 / 1024).toFixed(2) + ' MB'
}

onMounted(() => {
  fetchPictureDetail()
})
</script>

<style></style>
