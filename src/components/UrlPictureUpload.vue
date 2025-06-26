<template>
  <div class="url-picture-upload">
    <a-input-group compact style="margin-bottom: 16px">
      <a-input
        v-model:value="fileUrl"
        style="width: calc(100% - 120px)"
        placeholder="请输入图片 URL"
      />
      <a-button type="primary" :loading="loading" @click="handleUpload" style="width: 120px"
        >提交</a-button
      >
    </a-input-group>
    <img
      v-if="picture?.url"
      :src="picture?.url"
      alt="avatar"
      style="max-width: 100%; max-height: 320px; border-radius: 14px; margin-top: 16px"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
}

const props = defineProps<Props>()
const loading = ref(false)
const fileUrl = ref<string>()

watch(
  () => props.picture,
  (newVal) => {
    if (newVal?.url) {
      fileUrl.value = newVal.url
    }
  },
  { immediate: true },
)

const handleUpload = async () => {
  if (!fileUrl.value) {
    message.error('请输入图片 URL')
    return
  }
  loading.value = true
  try {
    const params: { fileUrl: string; id?: number } = { fileUrl: fileUrl.value }
    if (props.picture?.id) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch {
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.url-picture-upload {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto 18px auto;
}
</style>
