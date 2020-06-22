<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="Name"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
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
      <el-button
        v-permission="'role:add'"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >Add</el-button>
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
      <el-table-column label="Name" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Description" align="center" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Created Date" width="160" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createdDate | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Updated Date" width="160" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updatedDate | parseTime }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="checkPermission(['role:edit','role:delete'])"
        label="Actions"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row,$index}">
          <el-button v-permission="'role:edit'" type="primary" size="mini" @click="handleUpdate(row)">Edit</el-button>
          <el-button v-permission="'role:delete'" type="danger" size="mini" @click="handleDelete(row,$index)">Delete</el-button>
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

    <el-dialog
      :title="getTitle(temp.id)"
      :visible.sync="dialogFormVisible"
      @closed="clearCheckedKeys"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-width="100px"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
        <el-form-item label="Authority">
          <el-tree
            ref="tree"
            node-key="id"
            lazy
            show-checkbox
            check-strictly
            :load="loadTree"
            :default-checked-keys="temp.menus"
            :props="{children:'children',label:'name',isLeaf:'childless'}"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="temp.id?updateData():createData()">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRole, createRole, updateRole, deleteRole, getRoleMenus } from '@/api/role-custom'
import waves from '@/directive/waves' // waves directive
import permission from '@/directive/permission/index'
import checkPermission from '@/utils/permission'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { copy } from '@/utils/object'
import { listMenuTree } from '@/api/menu'
import { CREATE_SUCCESS, UPDATE_SUCCESS, DELETE_SUCCESS } from '@/utils/notification'

export default {
  name: 'Role',
  components: { Pagination },
  directives: { waves, permission },
  data() {
    return {
      list: null,
      total: 0,
      page: 1,
      listLoading: true,
      listQuery: {
        name: undefined,
        page: this.page - 1,
        size: 20,
        sort: 'id,ASC'
      },
      sortOptions: [
        { label: 'ID Ascending', key: 'id,ASC' },
        { label: 'ID Descending', key: 'id,DESC' }
      ],
      temp: {
        id: undefined,
        name: null,
        description: null,
        menus: []
      },
      dialogFormVisible: false,
      treeHasLoaded: false,
      rules: {
        name: [{ required: true, message: 'name is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    loadTree(node, resolve) {
      this.treeHasLoaded = true
      listMenuTree(node.data ? node.data.id : null).then(response => {
        resolve(response.data)
      })
    },
    clearCheckedKeys() {
      this.$refs['tree'].setCheckedKeys([])
    },
    getList() {
      this.listQuery.page = this.page - 1
      this.listLoading = true
      listRole(this.listQuery).then(response => {
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
    resetTemp() {
      this.temp = {
        id: null,
        name: null,
        description: null,
        menus: []
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.temp.menus = this.$refs['tree'].getCheckedKeys()
          createRole(this.temp).then(response => {
            const data = response.data

            this.total++
            if (
              this.page === Math.ceil(this.total / this.listQuery.size) &&
              this.listQuery.sort === 'id,ASC'
            ) {
              this.list.push(data)
            } else if (this.page === 1 && this.listQuery.sort === 'id,DESC') {
              this.list.unshift(data)
              if (this.total > this.listQuery.size) {
                this.list.pop()
              }
            }

            this.dialogFormVisible = false
            this.$notify(CREATE_SUCCESS)
          })
        }
      })
    },
    handleUpdate(row) {
      copy(this.temp, row)
      getRoleMenus(row.id).then(response => {
        const menus = response.data
        this.temp.menus = menus
        if (this.treeHasLoaded) {
          // if tree has not loaded,tree will init checked keys by default-checked-keys
          this.$refs['tree'].setCheckedKeys(menus)
        }
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.temp.menus = this.$refs['tree'].getCheckedKeys()
          updateRole(this.temp).then(response => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, response.data)
            this.dialogFormVisible = false
            this.$notify(UPDATE_SUCCESS)
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteRole(row.id).then(() => {
        this.total--
        this.list.splice(index, 1)
        this.$notify(DELETE_SUCCESS)
      })
    },

    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `${key},ASC` ? 'ascending' : 'descending'
    }
  }
}
</script>
