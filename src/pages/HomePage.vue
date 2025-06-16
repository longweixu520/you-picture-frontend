<template>
  <div id="homePage">
    <div class="main-content">
      <div class="search-bar-area">
        <a-input-search
          placeholder="搜索你感兴趣的图片"
          v-model:value="searchParams.searchText"
          enter-button="搜索"
          size="large"
          @search="doSearch"
        />
      </div>
      <div class="category-area">
        <a-tabs v-model:activeKey="selectedCategory" @change="doSearch" class="category-tabs">
          <a-tab-pane key="all" tab="全部" />
          <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
        </a-tabs>
      </div>
      <div class="tag-area">
        <span class="tag-label">标签：</span>
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag
            v-for="(tag, index) in tagList"
            :key="tag"
            v-model:checked="selectedTagList[index]"
            @change="doSearch"
            class="pill-tag"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
      <div class="picture-grid">
        <div
          v-for="picture in dataList"
          :key="picture.id"
          class="picture-card"
          @click="doClickPicture(picture)"
        >
          <div class="picture-img-wrapper">
            <img class="picture-img" :alt="picture.name" :src="picture.url" />
            <!-- 可选角标，如浏览量 -->
            <!-- <span class="corner-badge"><i class="iconfont icon-eye"></i> 210</span> -->
          </div>
          <div class="picture-info">
            <div class="picture-title" :title="picture.name">{{ picture.name }}</div>
            <div class="picture-meta tag-ellipsis">
              <a-tag :color="getCategoryColor(picture.category || '默认')" class="pill-tag">
                {{ picture.category ?? '默认' }}
              </a-tag>
              <span class="tag-list">
                <a-tag
                  v-for="(tag, idx) in Array.isArray(picture.tags)
                    ? picture.tags
                    : JSON.parse(picture.tags || '[]')"
                  :key="tag"
                  :color="getTagColor(tag)"
                  v-show="idx < 3"
                  class="pill-tag"
                >
                  {{ tag }}
                </a-tag>
                <span
                  v-if="
                    (Array.isArray(picture.tags)
                      ? picture.tags.length
                      : JSON.parse(picture.tags || '[]').length) > 3
                  "
                  class="tag-more"
                  >...</span
                >
              </span>
            </div>
          </div>
          <span class="card-more-btn"><i class="iconfont icon-more"></i></span>
        </div>
      </div>
      <div class="pagination-bar-abs">
        <a-pagination
          :current="searchParams.current"
          :pageSize="searchParams.pageSize"
          :total="total"
          show-size-changer
          @change="onPageChange"
          @showSizeChange="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  listPictureVoByPageUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 用于图片数据类型
interface PictureVO {
  id: number | string
  name: string
  url: string
  category?: string
  tags?: string[] | string
  [key: string]: any
}

const dataList = ref<PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
})

// 分类和标签
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])

// 分类色彩
const categoryColorMap: Record<string, string> = {
  默认: 'blue',
  电商: 'purple',
  模板: 'cyan',
  表情包: 'orange',
  素材: 'geekblue',
  海报: 'magenta',
  高清: 'green',
  校园: 'volcano',
  艺术: 'gold',
}
const getCategoryColor = (cat: string) => categoryColorMap[cat] || 'blue'

// 标签色彩
const tagColorList = [
  'green',
  'cyan',
  'geekblue',
  'purple',
  'magenta',
  'volcano',
  'gold',
  'lime',
  'orange',
]
const getTagColor = (tag: string) => {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash += tag.charCodeAt(i)
  return tagColorList[hash % tagColorList.length]
}

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
    selectedTagList.value = tagList.value.map(() => false)
  } else {
    message.error('加载分类标签失败，' + res.data.message)
  }
}

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params: Record<string, unknown> = {
    ...searchParams,
    tags: [],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  tagList.value.forEach((tag: string, index: number) => {
    if (selectedTagList.value[index]) {
      ;(params.tags as string[]).push(tag)
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = (res.data.data.records ?? []).map((item: unknown) => {
      const pic = item as Partial<PictureVO>
      return {
        ...pic,
        id: pic.id ?? '',
      } as PictureVO
    })
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 跳转至图片详情
const doClickPicture = (picture: PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

onMounted(() => {
  getTagCategoryOptions()
  fetchData()
})
</script>

<style scoped>
#homePage {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom right, #f0f2f5, #e0e7ef); /* Softer, more modern gradient */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}
.main-content {
  width: 90%; /* Changed from 100% to 90% */
  max-width: 1400px; /* Kept max-width for very large screens */
  margin: 32px auto 0 auto; /* Adjusted margin for top space */
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  padding: 32px; /* Simplified padding */
  position: relative;
  min-height: 80vh;
  box-sizing: border-box; /* Ensure padding is included in width */
}
.search-bar-area {
  width: 100%;
  max-width: 700px;
  margin: 0 auto 18px auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.category-area {
  width: 100%;
  margin-bottom: 10px;
}
.category-tabs {
  width: 100%;
  background: transparent;
  border-radius: 12px;
  padding: 0 0;
}
.tag-area {
  width: 100%;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tag-label {
  font-weight: 500;
  color: #555;
  margin-right: 8px;
}
.pill-tag {
  border-radius: 999px !important;
  padding: 0 14px !important;
  font-size: 14px !important;
  background: #f5f6fa !important;
  border: none !important;
  color: #666 !important;
  margin-right: 4px !important;
  margin-bottom: 4px !important;
}
.picture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  width: 100%;
  margin: 0 auto;
  min-height: 400px;
}
.picture-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); /* Softer, more subtle shadow */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease; /* Smoother transition */
  cursor: pointer;
  position: relative;
  min-height: 320px;
}
.picture-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1); /* Enhanced hover shadow */
  transform: translateY(-5px); /* Slight lift effect on hover */
}
.picture-img-wrapper {
  width: 100%;
  aspect-ratio: 16/10;
  background: #f0f2f5;
  position: relative;
  border-top-left-radius: 16px; /* Rounded corners for the image */
  border-top-right-radius: 16px; /* Rounded corners for the image */
  overflow: hidden; /* Ensure image respects border-radius */
}
.picture-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}
.corner-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 13px;
  border-radius: 12px;
  padding: 2px 10px;
  z-index: 2;
}
.picture-info {
  padding: 12px 16px 8px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 56px;
  flex: 1 1 auto;
}
.picture-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.picture-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  position: relative;
}
.tag-list {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 6px;
  max-width: 120px;
  overflow: hidden;
  vertical-align: middle;
  position: relative;
}
.tag-more {
  color: #aaa;
  font-size: 16px;
  margin-left: 2px;
  cursor: pointer;
}
.card-more-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 20px;
  color: #bbb;
  background: #f7f7fa;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: background 0.2s;
}
.card-more-btn:hover {
  background: #e6f7ff;
  color: #1890ff;
}
.pagination-bar-abs {
  position: absolute;
  right: 32px;
  bottom: 24px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 8px 24px;
  display: flex;
  align-items: center;
}
@media (max-width: 1500px) {
  .main-content {
    max-width: 99vw;
    padding: 18px 2vw 64px 2vw;
  }
}
@media (max-width: 900px) {
  .main-content {
    padding: 2% 2%; /* Percentage-based padding for smaller screens */
    margin: 8px auto; /* Centered margin for smaller screens */
  }
  .search-bar-area {
    max-width: 95%; /* Adjusted max-width for search bar on smaller screens */
    padding: 0;
  }
  .picture-grid {
    grid-template-columns: repeat(auto-fill, minmax(90vw, 1fr)); /* Adjusted for smaller screens */
  }
  .pagination-bar-abs {
    right: 2%; /* Percentage-based positioning */
    bottom: 2%; /* Percentage-based positioning */
    padding: 4px 8px;
  }
}
</style>
