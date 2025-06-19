<template>
  <div class="add-picture-page-vertical">
    <h2 class="add-picture-title">
      {{ route.query?.id ? '修改图片' : '创建图片' }}
    </h2>
    <div class="add-picture-card">
      <PictureUpload :picture="picture" :onSuccess="onSuccess" />
      <div v-if="picture && picture.url" class="picture-preview">
        <img :src="picture.url" alt="图片预览" />
      </div>
      <a-form
        v-if="picture && picture.url"
        layout="vertical"
        :model="pictureForm"
        @finish="handleSubmit"
        class="add-picture-form"
      >
        <a-form-item name="name" label="名称">
          <a-input v-model:value="pictureForm.name" placeholder="请输入名称" allow-clear />
        </a-form-item>
        <a-form-item name="introduction" label="简介">
          <a-textarea
            v-model:value="pictureForm.introduction"
            placeholder="请输入简介"
            :auto-size="{ minRows: 2, maxRows: 5 }"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="category" label="分类">
          <a-auto-complete
            v-model:value="pictureForm.category"
            placeholder="请输入分类"
            :options="categoryOptions"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="tags" label="标签">
          <a-select
            v-model:value="pictureForm.tags"
            mode="tags"
            placeholder="请输入标签"
            :options="tagOptions"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%">
            {{ route.query?.id ? '保存' : '创建' }}
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button danger style="width: 100%" @click="handleCancel">取消</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
  deletePictureUsingPost,
} from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const picture = ref<API.PictureVO>()
const pictureForm = reactive<{
  name?: string
  introduction?: string
  category?: string
  tags?: string[]
}>({})

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
  pictureForm.introduction = newPicture.introduction
  pictureForm.category = newPicture.category
  pictureForm.tags = Array.isArray(newPicture.tags)
    ? newPicture.tags
    : typeof newPicture.tags === 'string'
      ? JSON.parse(newPicture.tags)
      : []
}

const handleSubmit = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    message.error('请先上传图片')
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
    tags: Array.isArray(values.tags) ? values.tags : [],
  })
  if (res.data.code === 0 && res.data.data) {
    message.success(route.query?.id ? '保存成功' : '创建成功')
    router.push({ path: `/picture/${pictureId}` })
  } else {
    message.error('操作失败，' + res.data.message)
  }
}

const handleCancel = async () => {
  // 新建时，上传后点击取消，删除COS图片且不保存数据库
  if (picture.value?.id && !route.query?.id) {
    await deletePictureUsingPost({ id: picture.value.id })
  }
  router.push('/admin/picture_manage')
}

const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => ({
      value: data,
      label: data,
    }))
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => ({
      value: data,
      label: data,
    }))
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}

const getOldPicture = async () => {
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({ id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === 'string'
          ? JSON.parse(data.tags)
          : []
    }
  } else {
    picture.value = undefined
    pictureForm.name = ''
    pictureForm.introduction = ''
    pictureForm.category = ''
    pictureForm.tags = []
  }
}

onMounted(() => {
  getTagCategoryOptions()
  getOldPicture()
})

watch(
  () => route.query.id,
  () => {
    getOldPicture()
  },
)
</script>

<style scoped>
.add-picture-page-vertical {
  max-width: 520px;
  margin: 40px auto 0 auto;
  padding: 24px 0 40px 0;
}
.add-picture-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 32px;
  letter-spacing: 2px;
}
.add-picture-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.add-picture-form {
  width: 100%;
  margin-top: 24px;
}
.picture-preview {
  margin-top: 24px;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.picture-preview img {
  width: 100%;
  display: block;
  border-radius: 12px;
}
@media (max-width: 900px) {
  .add-picture-page-vertical {
    max-width: 100%;
    padding: 12px 0 24px 0;
  }
  .add-picture-card {
    padding: 16px 4px;
  }
  .picture-preview {
    max-width: 100%;
  }
}
</style>
