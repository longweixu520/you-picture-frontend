<template>
  <div id="pictureManagePage" class="picture-manage-container">
    <a-flex justify="space-between" align="center">
      <h2>图片管理</h2>
      <a-space>
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="table">表格视图</a-radio-button>
          <a-radio-button value="card">卡片视图</a-radio-button>
        </a-radio-group>
        <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
        <a-button type="primary" href="/add_picture/batch" target="_blank" ghost>+ 批量创建图片</a-button>
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
        <!--      <a-form-item name="reviewStatus" label="审核状态">-->
        <!--        <a-select-->
        <!--          v-model:value="searchParams.reviewStatus"-->
        <!--          style="min-width: 180px"-->
        <!--          placeholder="请选择审核状态"-->
        <!--          :options="PIC_REVIEW_STATUS_OPTIONS"-->
        <!--          allow-clear-->
        <!--        />-->
        <!--      </a-form-item>-->
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
        :pagination="pagination"
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
              :width="160"
              :height="90"
              :style="{ objectFit: 'cover' }"
              :preview="{
                src: record.url
              }"
            />
          </template>
          <template v-if="column.dataIndex === 'basicInfo'">
            <div><strong>{{ record.name }}</strong></div>
            <div>{{ record.introduction }}</div>
            <div>类型：{{ record.category }}</div>
            <div class="tags-container">
              <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">
                {{ tag }}
              </a-tag>
            </div>
          </template>
          <template v-if="column.dataIndex === 'userInfo'">
            <div>用户ID：{{ record.userId }}</div>
            <div>空间ID：{{ record.spaceId }}</div>
          </template>
          <template v-if="column.dataIndex === 'picInfo'">
            <div>格式：{{ record.picFormat }}</div>
            <div>尺寸：{{ record.picWidth }}×{{ record.picHeight }}</div>
            <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
          </template>
          <template v-if="column.dataIndex === 'timeInfo'">
            <div>创建：{{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}</div>
            <div>编辑：{{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm') }}</div>
          </template>
          <template v-if="column.dataIndex === 'reviewInfo'">
            <div>状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
            <div v-if="record.reviewMessage">信息：{{ record.reviewMessage }}</div>
            <div v-if="record.reviewerId">审核人：{{ record.reviewerId }}</div>
            <div v-if="record.reviewTime">
              时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm') }}
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank">
                编辑
              </a-button>
              <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
            </a-space>
            <!--          <a-space wrap>-->
            <!--            <a-button-->
            <!--              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"-->
            <!--              type="link"-->
            <!--              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"-->
            <!--            >-->
            <!--              通过-->
            <!--            </a-button>-->
            <!--            <a-button-->
            <!--              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"-->
            <!--              type="link"-->
            <!--              danger-->
            <!--              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"-->
            <!--            >-->
            <!--              拒绝-->
            <!--            </a-button>-->
            <!--          </a-space>-->
          </template>
        </template>
      </a-table>
    </div>

    <!-- 卡片视图 -->
    <div v-else class="card-container">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" v-for="(record, index) in dataList" :key="index">
          <a-card class="picture-card">
            <template #cover>
              <a-image
                :src="record.url"
                :height="160"
                :style="{ width: '100%', objectFit: 'cover' }"
                :preview="{
                  src: record.url
                }"
              />
            </template>
            <a-card-meta :title="record.name" :description="record.introduction" />
            <div class="card-content">
              <div class="card-tags">
                <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">
                  {{ tag }}
                </a-tag>
              </div>
              <div class="card-info">
                <div>类型：{{ record.category }}</div>
                <div>尺寸：{{ record.picWidth }}×{{ record.picHeight }}</div>
                <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
              </div>
              <div class="card-actions">
                <a-space>
                  <a-button type="link" size="small" :href="`/add_picture?id=${record.id}`" target="_blank">
                    编辑
                  </a-button>
                  <a-button type="link" size="small" danger @click="doDelete(record.id)">删除</a-button>
                </a-space>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
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
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  // doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
// import {
//   PIC_REVIEW_STATUS_ENUM,
//   PIC_REVIEW_STATUS_MAP,
//   PIC_REVIEW_STATUS_OPTIONS,
// } from '../../constants/picture.ts'
import dayjs from 'dayjs'

// 临时定义，实际使用时请从 constants/picture.ts 导入
const PIC_REVIEW_STATUS_MAP: Record<number, string> = {
  0: '待审核',
  1: '通过',
  2: '拒绝'
}

const viewMode = ref<'table' | 'card'>('table')

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 60,
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 180,
  },
  {
    title: '基本信息',
    dataIndex: 'basicInfo',
  },
  {
    title: '用户信息',
    dataIndex: 'userInfo',
    width: 120,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 120,
  },
  {
    title: '时间信息',
    dataIndex: 'timeInfo',
    width: 150,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewInfo',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
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

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 表格变化之后，重新获取数据
const doTableChange = (page: any) => {
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
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  try {
    const res = await deletePictureUsingPost({ id })
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

// // 审核图片
// const handleReview = async (record: API.Picture, reviewStatus: number) => {
//   const reviewMessage =
//     reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
//   const res = await doPictureReviewUsingPost({
//     id: record.id,
//     reviewStatus,
//     reviewMessage,
//   })
//   if (res.data.code === 0) {
//     message.success('审核操作成功')
//     // 重新获取列表数据
//     fetchData()
//   } else {
//     message.error('审核操作失败，' + res.data.message)
//   }
// }
</script>

<style scoped>
.picture-manage-container {
  padding: 16px 24px;
  background: #fff;
  min-height: 100%;
}

.search-container {
  margin: 16px 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.table-container {
  margin-top: 16px;
}

.card-container {
  margin-top: 16px;
}

.picture-card {
  margin-bottom: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-content {
  margin-top: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-tags {
  margin: 8px 0;
}

.card-info {
  margin: 8px 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.card-actions {
  margin-top: auto;
  text-align: right;
}

.tags-container {
  margin-top: 8px;
}

.pagination-container {
  margin-top: 16px;
  text-align: right;
}
</style>
