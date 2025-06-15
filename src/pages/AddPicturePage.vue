<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改图片' : '创建图片' }}
    </h2>
    <PictureUpload :picture="picture" :onSuccess="onSuccess" />
    <a-form v-if="picture" layout="vertical" :model="pictureForm" @finish="handleSubmit">
      <a-form-item label="名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :rows="2"
          autoSize
          allowClear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions.map((item) => ({ value: item }))"
          allowClear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions.map((item) => ({ value: item, label: item }))"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
      </a-form-item>
      <a-form-item>
        <a-button danger style="width: 100%" @click="handleCancel">取消</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref } from 'vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
  deletePictureUsingPost,
} from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const picture = ref<API.PictureVO>()
const pictureForm = reactive<{
  name?: string
  introduction?: string
  category?: string
  tags?: string[]
}>({})
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
  pictureForm.introduction = newPicture.introduction
  pictureForm.category = newPicture.category
  pictureForm.tags =
    typeof newPicture.tags === 'string' ? JSON.parse(newPicture.tags) : newPicture.tags
}
const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: Record<string, any>) => {
  const pictureId = picture.value?.id
  if (!pictureId) return
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
    tags: Array.isArray(values.tags) ? values.tags : [],
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}
const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 直接使用字符串数组，因为a-select和a-auto-complete可以直接使用
    tagOptions.value = res.data.data.tagList ?? []
    categoryOptions.value = res.data.data.categoryList ?? []
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const route = useRoute()

// 获取老数据
const getOldPicture = async () => {
  // 获取数据
  const idRaw = route.query?.id
  const id =
    typeof idRaw === 'string' ? Number(idRaw) : Array.isArray(idRaw) ? Number(idRaw[0]) : undefined
  if (id) {
    const res = await getPictureVoByIdUsingGet({ id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags
    }
  }
}

onMounted(() => {
  getOldPicture()
})

const handleCancel = async () => {
  if (picture.value?.id) {
    await deletePictureUsingPost({ id: picture.value.id })
  }
  router.push('/admin/picture_manage')
}
</script>

<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
