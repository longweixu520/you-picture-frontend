<template>
  <div id="pictureManagePage" class="main-container">
    <a-flex justify="space-between" align="center">
      <h2>图片管理</h2>
      <a-space>
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="table">表格视图</a-radio-button>
          <a-radio-button value="card">卡片视图</a-radio-button>
        </a-radio-group>
        <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
        <a-button type="primary" href="/add_picture/batch" target="_blank" ghost
          >+ 批量创建图片</a-button
        >
      </a-space>
    </a-flex>

    <div class="search-container">
      <!-- 搜索表单 -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="关键词">
          <a-input
            v-model:value="searchParams.searchText"
            placeholder="从名称和简介搜索"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="类型">
          <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            v-model:value="searchParams.tags"
            mode="tags"
            placeholder="请输入标签"
            style="min-width: 180px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="审核状态" name="reviewStatus">
          <a-select
            v-model:value="searchParams.reviewStatus"
            :options="PIC_REVIEW_STATUS_OPTIONS"
            placeholder="请输入审核状态"
            style="min-width: 180px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-container">
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="false"
        @change="doTableChange"
        :rowKey="(record, index) => index"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 + (searchParams.current - 1) * searchParams.pageSize }}
          </template>
          <template v-if="column.dataIndex === 'url'">
            <a-image
              :src="record.url"
              :width="200"
              :height="112"
              :style="{ objectFit: 'cover', borderRadius: '4px' }"
              :preview="{ src: record.url }"
            />
          </template>
          <template v-if="column.dataIndex === 'basicInfo'">
            <div>
              <strong>{{ record.name }}</strong>
            </div>
            <div>类型：{{ record.category }}</div>
            <div class="tags-container">
              <a-tag
                v-for="tag in Array.isArray(record.tags)
                  ? record.tags
                  : JSON.parse(record.tags || '[]')"
                :key="tag"
              >
                {{ tag }}
              </a-tag>
            </div>
          </template>
          <template v-if="column.dataIndex === 'introduction'">
            <div style="max-width: 200px; white-space: pre-line; word-break: break-all">
              {{ record.introduction }}
            </div>
          </template>
          <template v-if="column.dataIndex === 'reviewMessage'">
            <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
            <div>审核信息：{{ record.reviewMessage }}</div>
            <div>审核人：{{ record.reviewerId }}</div>
          </template>
          <template v-if="column.dataIndex === 'userInfo'">
            <div>用户ID：{{ record.userId }}</div>
            <div>空间ID：{{ record.spaceId || '-' }}</div>
          </template>
          <template v-if="column.dataIndex === 'timeInfo'">
            <div>创建：{{ dayjs(record.createTime).format('YYYY-MM-DD') }}</div>
            <div>编辑：{{ dayjs(record.editTime).format('YYYY-MM-DD') }}</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                type="link"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >
                通过
              </a-button>
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                type="link"
                danger
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              >
                拒绝
              </a-button>
              <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank"
                >编辑</a-button
              >
              <a-button type="link" danger @click="doDelete(record.id!)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
      <div class="pagination-container">
        <a-pagination
          v-model:current="searchParams.current"
          v-model:pageSize="searchParams.pageSize"
          :total="total"
          show-size-changer
          @change="fetchData"
          @showSizeChange="fetchData"
        />
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-else class="card-container card-grid">
      <div class="card-list">
        <div class="picture-card card-hover" v-for="(record, index) in dataList" :key="index">
          <div class="card-image-wrapper">
            <a-image
              :src="record.url"
              :style="{
                aspectRatio: '16/9',
                width: '100%',
                objectFit: 'cover',
                borderRadius: '4px',
              }"
              :preview="{ src: record.url }"
            />
          </div>
          <div class="card-info-block">
            <div class="card-title">{{ record.name }}</div>
            <div class="card-category">类型：{{ record.category }}</div>
            <div class="card-tags">
              <a-tag
                v-for="tag in Array.isArray(record.tags)
                  ? record.tags
                  : JSON.parse(record.tags || '[]')"
                :key="tag"
              >
                {{ tag }}
              </a-tag>
            </div>
            <div class="card-time">创建：{{ dayjs(record.createTime).format('YYYY-MM-DD') }}</div>
            <div class="card-actions">
              <a-button
                type="link"
                size="small"
                :href="`/add_picture?id=${record.id}`"
                target="_blank"
                >编辑</a-button
              >
              <a-button type="link" size="small" danger @click="doDelete(record.id!)"
                >删除</a-button
              >
            </div>
          </div>
        </div>
      </div>
      <div class="pagination-container">
        <a-pagination
          v-model:current="searchParams.current"
          v-model:pageSize="searchParams.pageSize"
          :total="total"
          show-size-changer
          @change="fetchData"
          @showSizeChange="fetchData"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/picture.ts'
import dayjs from 'dayjs'
import type { TablePaginationConfig } from 'ant-design-vue/es/table'

const viewMode = ref<'table' | 'card'>('table')

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 60,
    align: 'center',
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 220,
    align: 'center',
  },
  {
    title: '基本信息',
    dataIndex: 'basicInfo',
    align: 'center',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    align: 'center',
    width: 160,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    align: 'center',
    width: 160,
  },
  {
    title: '用户信息',
    dataIndex: 'userInfo',
    width: 120,
    align: 'center',
  },
  {
    title: '时间信息',
    dataIndex: 'timeInfo',
    width: 160,
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    align: 'center',
  },
]

// 定义数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  try {
    const res = await listPictureByPageUsingPost({
      ...searchParams,
      nullSpaceId: true,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (e) {
    message.error('请求失败，请检查网络')
  }
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

// 表格变化之后，重新获取数据
const doTableChange = (page: Partial<TablePaginationConfig>) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 搜索数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 删除数据
const doDelete = async (id: number | string) => {
  if (!id) {
    return
  }
  try {
    const res = await deletePictureUsingPost({ id: String(id) })
    if (res.data.code === 0) {
      message.success('删除成功')
      // 刷新数据
      fetchData()
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (e) {
    message.error('删除请求失败')
  }
}

// 审核图片
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 重新获取列表数据
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }
}
</script>

<style scoped>
.search-container {
  margin: 12px 0 0 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}
.table-container,
.card-container {
  margin-top: 12px;
}
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.picture-card {
  position: relative;
  width: 320px;
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: #fff;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}
.picture-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}
.card-info-block {
  padding: 16px 12px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}
.card-category {
  font-size: 14px;
  margin-bottom: 8px;
}
.card-tags {
  margin-bottom: 8px;
}
.card-time {
  font-size: 12px;
  margin-bottom: 12px;
}
.card-actions {
  display: flex;
  gap: 8px;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 48px;
  width: 100%;
}
</style>
