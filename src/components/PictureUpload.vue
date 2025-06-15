<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
      accept="image/jpeg,image/png"
    >
      <template v-if="props.picture && getPictureUrl()">
        <img
          :src="getPictureUrl()"
          alt="uploaded picture"
          class="uploaded-image"
        />
      </template>
      <div v-else>
        <loading-outlined v-if="loading" />
        <plus-outlined v-else />
        <div class="ant-upload-text">
          {{ loading ? '上传中...' : '点击或拖拽上传图片' }}
        </div>
      </div>
    </a-upload>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { UploadProps } from 'ant-design-vue';
import { uploadPictureUsingPost } from '@/api/pictureController';

interface Props {
  picture?: API.PictureVO;
  onSuccess?: (picture: API.PictureVO) => void;
  onError?: (error: Error) => void;
}

const props = defineProps<Props>();
const loading = ref(false);

const getPictureUrl = (): string | undefined => {
  // 根据实际API返回结构调整URL字段
  return props.picture?.url
};

const handleUpload = async ({ file }: { file: File }) => {
  if (!file) return;

  loading.value = true;
  try {
    const params = props.picture ? { id: props.picture.id } : {};
    const res = await uploadPictureUsingPost(params, {}, file);

    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功');
      props.onSuccess?.(res.data.data);
    } else {
      message.error(res.data.message || '图片上传失败');
      props.onError?.(new Error(res.data.message));
    }
  } catch (error) {
    message.error('图片上传失败');
    props.onError?.(error as Error);
  } finally {
    loading.value = false;
  }
};

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('仅支持 JPG/PNG 格式图片');
    return false;
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB');
    return false;
  }

  return true;
};
</script>

<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

</style>
