<template>
  <div class="picture-upload-long">
    <a-upload
      class="upload-bar"
      drag
      list-type="picture"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
      accept="image/jpeg,image/png"
      :file-list="fileList"
    >
      <template v-if="props.picture && getPictureUrl()">
        <img :src="getPictureUrl()" alt="uploaded picture" class="uploaded-image" />
      </template>
      <div v-else class="upload-bar-content">
        <loading-outlined v-if="loading" style="font-size: 32px; color: #1677ff" />
        <plus-outlined v-else style="font-size: 32px; color: #1677ff" />
        <div class="upload-bar-title">点击或拖拽图片到此处上传</div>
        <div class="upload-bar-desc">支持 JPG/PNG 格式，最大 2MB</div>
      </div>
    </a-upload>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
  onError?: (error: Error) => void
}

const props = defineProps<Props>()
const loading = ref(false)
const fileList = ref<any[]>([])

watch(
  () => props.picture,
  (newVal) => {
    if (newVal && newVal.url) {
      fileList.value = [
        {
          uid: newVal.id ? String(newVal.id) : '-1',
          name: newVal.name || '图片',
          status: 'done',
          url: newVal.url,
        },
      ]
    } else {
      fileList.value = []
    }
  },
  { immediate: true },
)

const getPictureUrl = (): string | undefined => {
  // 根据实际API返回结构调整URL字段
  return props.picture?.url
}

const handleUpload = async ({ file }: { file: File }) => {
  if (!file) return

  loading.value = true
  try {
    const params = props.picture ? { id: props.picture.id } : {}
    const res = await uploadPictureUsingPost(params, {}, file)

    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
    } else {
      message.error(res.data.message || '图片上传失败')
      props.onError?.(new Error(res.data.message))
    }
  } catch (error) {
    message.error('图片上传失败')
    props.onError?.(error as Error)
  } finally {
    loading.value = false
  }
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('仅支持 JPG/PNG 格式图片')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB')
    return false
  }

  return true
}
</script>

<style scoped>
.picture-upload-long {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 18px auto;
}
.upload-bar {
  width: 100%;
  max-width: 900px;
  min-width: 420px;
  min-height: 120px;
  background: linear-gradient(135deg, #f8fafc 60%, #e6f0fa 100%);
  border: 2px dashed #b3c6e0;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(22, 119, 255, 0.04);
  position: relative;
}
.upload-bar:hover,
.upload-bar.ant-upload-drag-hover {
  border-color: #1677ff;
  background: linear-gradient(135deg, #e6f0fa 60%, #f8fafc 100%);
  box-shadow: 0 4px 24px rgba(22, 119, 255, 0.1);
}
.upload-bar-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 18px 0;
}
.upload-bar-title {
  font-size: 20px;
  color: #1677ff;
  margin-top: 10px;
  font-weight: 700;
}
.upload-bar-desc {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}
.uploaded-image {
  max-width: 100%;
  max-height: 320px;
  border-radius: 14px;
  display: block;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(22, 119, 255, 0.08);
  border: 1.5px solid #e6f0fa;
}
</style>
