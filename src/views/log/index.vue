<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.type"
        style="width: 140px"
        class="filter-item"
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-input
        v-model="listQuery.keyword"
        :placeholder="typeKeyValue[listQuery.type]"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.operation"
        placeholder="Operation"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-date-picker
        v-model="dateRange"
        value-format="yyyy-MM-dd HH:mm:ss"
        format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        start-placeholder="Start date"
        end-placeholder="End date"
        class="filter-item"
        @change="handleFilter"
      />
      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >Search</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Username" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Operation" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Created Date" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createdDate | parseTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="page"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listLog } from '@/api/log'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const typeOptions = [
  { key: 'USERNAME', label: 'Username' },
  { key: 'NAME', label: 'Name' }
]

const typeKeyValue = typeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.label
  return acc
}, {})

export default {
  name: 'Log',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      page: 1,
      listLoading: true,
      listQuery: {
        keyword: undefined,
        type: 'USERNAME',
        operation: undefined,
        startDate: undefined,
        endDate: undefined,
        page: this.page - 1,
        size: 20,
        sort: 'id,DESC'
      },
      dateRange: [parseTime(new Date(new Date().setHours(0, 0, 0, 0))), parseTime(new Date(new Date().setHours(24, 0, 0, 0)))],
      typeOptions,
      typeKeyValue,
      sortOptions: [
        { label: 'ID Ascending', key: 'id,ASC' },
        { label: 'ID Descending', key: 'id,DESC' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listQuery.page = this.page - 1
      this.listQuery.startDate = this.dateRange[0]
      this.listQuery.endDate = this.dateRange[1]
      this.listLoading = true

      listLog(this.listQuery).then(response => {
        const data = response.data

        this.list = data.content
        this.total = data.totalElements

        this.listLoading = false
      })
    },
    handleFilter() {
      this.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'id,ASC'
      } else {
        this.listQuery.sort = 'id,DESC'
      }
      this.handleFilter()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `${key},ASC` ? 'ascending' : 'descending'
    }
  }
}
</script>
