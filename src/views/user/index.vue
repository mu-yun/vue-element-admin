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
        placeholder="Keyword"
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
      <el-table-column label="Username" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Phone Number" align="center" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.phoneNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Roles" align="center" min-width="150">
        <template slot-scope="{row}">
          <span>
            <el-tag v-for="item in row.roles" :key="item.id" style="margin-left:10px">{{ item.name }}</el-tag>
          </span>
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
        label="Actions"
        align="center"
        width="250"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">Edit</el-button>
          <el-button type="success" size="mini" @click="handleResetPassowrd(row)">Password</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row,$index)">Delete</el-button>
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
      :title="resetPassword?'Update Password':getTitle(temp.id)"
      :visible.sync="dialogFormVisible"
      @open="getRoleOptions"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-width="115px"
      >
        <el-form-item label="Username" prop="username">
          <el-input v-model="temp.username" :disabled="resetPassword" />
        </el-form-item>
        <template v-if="!(temp.id&&!resetPassword)">
          <el-form-item label="Password" prop="password">
            <el-input v-model="temp.password" show-password />
          </el-form-item>
          <el-form-item label="Confirm" prop="confirmPassword">
            <el-input v-model="temp.confirmPassword" show-password />
          </el-form-item>
        </template>
        <template v-if="!resetPassword">
          <el-form-item label="Name" prop="name">
            <el-input v-model="temp.name" />
          </el-form-item>
          <el-form-item label="Phone Number" prop="phoneNumber">
            <el-input v-model="temp.phoneNumber" />
          </el-form-item>
          <el-form-item label="Roles">
            <el-select v-model="temp.roles" style="width:100%" multiple filterable placeholder="please select">
              <el-option
                v-for="item in roleOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </template>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="resetPassword?updatePassword():(temp.id?updateData():createData())">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, createUser, updateUser, deleteUser, updatePassword } from '../../api/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { copy } from '../../utils/object'
import { CREATE_SUCCESS, UPDATE_SUCCESS, DELETE_SUCCESS } from '../../utils/notification'
import { getAllRoles } from '../../api/role-custom'

export default {
  name: 'User',
  components: { Pagination },
  directives: { waves },
  data() {
    var validatePassword = (rule, value, callback) => {
      if (value === null || value === '') {
        callback(new Error('Password is required'))
      } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
        callback(new Error('Password must be alphanumeric'))
      } else if (!(value.length >= 6 && value.length <= 16)) {
        callback(new Error('Password length must be between 6 and 16'))
      } else {
        if (this.temp.confirmPassword !== '' && this.temp.confirmPassword !== null) {
          this.$refs['dataForm'].validateField('confirmPassword')
        }
        callback()
      }
    }
    var validateConfirmPassword = (rule, value, callback) => {
      if (this.temp.password === null || this.temp.password === '') {
        callback()
      } else if (value === null || value === '') {
        callback(new Error('Please input password again'))
      } else if (value !== this.temp.password) {
        callback(new Error('Two passwords don\'t match.Try again'))
      } else {
        callback()
      }
    }
    return {
      list: null,
      total: 0,
      page: 1,
      listLoading: true,
      listQuery: {
        keyword: undefined,
        type: 'USERNAME',
        page: this.page - 1,
        size: 20,
        sort: 'id,ASC'
      },
      typeOptions: [
        { key: 'USERNAME', label: 'Username' },
        { key: 'NAME', label: 'Name' }
      ],
      sortOptions: [
        { label: 'ID Ascending', key: 'id,ASC' },
        { label: 'ID Descending', key: 'id,DESC' }
      ],
      roleOptions: [],
      temp: {
        id: undefined,
        username: null,
        password: null,
        confirmPassword: null,
        name: null,
        phoneNumber: null,
        roles: []
      },
      dialogFormVisible: false,
      resetPassword: false,
      rules: {
        username: [
          { required: true, message: 'Username is required', trigger: 'blur' },
          { pattern: /^[a-zA-Z][a-zA-Z0-9]*$/, message: 'Username must be alphanumeric and start with a letter', trigger: 'blur' },
          { min: 5, max: 16, message: 'Username length must be between 5 and 16', trigger: 'blur' }
        ],
        name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
        password: [
          { validator: validatePassword, required: true, trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validateConfirmPassword, required: true, trigger: 'blur' }
        ],
        phoneNumber: [{ pattern: /^1[0-9]{10}$/, message: 'Incorrect phone number', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listQuery.page = this.page - 1
      this.listLoading = true
      listUser(this.listQuery).then(response => {
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
        id: undefined,
        username: null,
        password: null,
        confirmPassword: null,
        name: null,
        phoneNumber: null,
        roles: []
      }
    },
    getRoleOptions() {
      if (this.resetPassword) { return }
      getAllRoles().then((response) => {
        this.roleOptions = response.data
      })
    },
    handleCreate() {
      this.resetPassword = false
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createUser(this.temp).then(response => {
            const data = response.data

            if (
              this.page === Math.ceil(this.total / this.listQuery.size) &&
              this.listQuery.sort === 'id,ASC'
            ) {
              this.list.push(data)
            } else if (this.page === 1 && this.listQuery.sort === 'id,DESC') {
              this.list.unshift(data)
            }

            this.dialogFormVisible = false
            this.$notify(CREATE_SUCCESS)
          })
        }
      })
    },
    handleUpdate(row) {
      this.resetPassword = false
      copy(this.temp, row)
      this.temp.roles = this.temp.roles.map(r => r.id)
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateUser(this.temp).then(response => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, response.data)
            this.dialogFormVisible = false
            this.$notify(UPDATE_SUCCESS)
          })
        }
      })
    },
    handleResetPassowrd(row) {
      this.resetPassword = true
      copy(this.temp, row)
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updatePassword() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updatePassword(this.temp).then((response) => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, response.data)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Password Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteUser(row.id).then(() => {
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
