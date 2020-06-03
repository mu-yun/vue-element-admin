<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="width:100%"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate()"
      >Add</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      row-key="id"
      lazy
      :load="getChildren"
      :row-props="{children:'children',hasChildren:'hasChildren'}"
      style="width: 100%;"
    >
      <el-table-column label="Name" min-width="150" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="80" align="center">
        <template slot-scope="{row}">
          <span>{{ row.type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Icon" width="60" align="center">
        <template slot-scope="{row}">
          <span>{{ row.icon }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Path" width="150" align="center">
        <template slot-scope="{row}">
          <span>{{ row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Component Path" width="150" align="center">
        <template slot-scope="{row}">
          <span>{{ row.componentPath }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Url" width="150" align="center">
        <template slot-scope="{row}">
          <span>{{ row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Method" width="80" align="center">
        <template slot-scope="{row}">
          <span>{{ row.httpMethod | httpMethodFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Authority" width="150" align="center">
        <template slot-scope="{row}">
          <span>{{ row.authority }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hidden" width="80" align="center">
        <template slot-scope="{row}">
          <span>{{ row.hidden }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Sequence Number" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sequenceNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="Actions"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="success" size="mini" @click="handleUpdate(row)">Edit</el-button>
          <el-button :disabled="row.type===2" type="primary" size="mini" @click="handleCreate(row)">Add</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="getTitle(temp.id)" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-width="100px">
        <el-form-item v-if="parent&&parent.name" label="Parent Menu">
          <el-input v-model="parent.name" :disabled="true" />
        </el-form-item>
        <el-form-item label="Type" prop="type">
          <el-radio-group v-model="temp.type" :disabled="temp.id!==null||parent!==undefined">
            <el-radio-button
              v-for="item in typeOptions"
              :key="item.key"
              :label="item.key"
            >{{ item.display_name }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <template v-if="temp.type!==2">
          <el-form-item label="Icon">
            <el-input v-model="temp.icon" />
          </el-form-item>
          <el-form-item label="Path" prop="path">
            <el-input v-model="temp.path" />
          </el-form-item>
        </template>
        <template v-if="temp.type===1">
          <el-form-item label="Comp Name" prop="componentName">
            <el-input v-model="temp.componentName" />
          </el-form-item>
          <el-form-item label="Comp Path" prop="componentPath">
            <el-input v-model="temp.componentPath" />
          </el-form-item>
        </template>
        <template v-if="temp.type!==0">
          <el-form-item label="Url" prop="url">
            <el-input v-model="temp.url" />
          </el-form-item>
          <el-form-item label="Http Method">
            <el-radio-group v-model="temp.httpMethod">
              <el-radio-button
                v-for="item in httpMethodOptions"
                :key="item.key"
                :label="item.key"
              >{{ item.display_name }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>
        <el-form-item label="Authority" prop="authority">
          <el-input v-model="temp.authority" />
        </el-form-item>
        <el-form-item v-if="temp.type!==2" label="Hidden">
          <el-switch v-model="temp.hidden" />
        </el-form-item>
        <el-form-item label="Sequence">
          <el-input-number v-model="temp.sequenceNumber" controls-position="right" :min="0" :max="999" />
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
import { listMenu, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import { copy } from '@/utils/object'
import waves from '@/directive/waves' // waves directive
import { CREATE_SUCCESS, UPDATE_SUCCESS, DELETE_SUCCESS } from '../../utils/notification'

const httpMethodOptions = [
  { key: 0, display_name: 'GET' },
  { key: 2, display_name: 'POST' },
  { key: 3, display_name: 'PUT' },
  { key: 5, display_name: 'DELETE' }
]
const typeOptions = [
  { key: 0, display_name: 'Catagory' },
  { key: 1, display_name: 'Menu' },
  { key: 2, display_name: 'Button' }
]

const typeKeyValue = typeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})
const httpMethodKeyValue = httpMethodOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Menu',
  directives: { waves },
  filters: {
    typeFilter(type) {
      return typeKeyValue[type]
    },
    httpMethodFilter(httpMethod) {
      return httpMethodKeyValue[httpMethod]
    }
  },
  data() {
    return {
      list: [],
      listLoading: true,
      typeOptions,
      httpMethodOptions,
      parent: undefined,
      temp: {
        id: null,
        parentId: null,
        name: null,
        type: 0,
        icon: null,
        path: null,
        componentName: null,
        componentPath: null,
        url: null,
        httpMethod: null,
        authority: null,
        hidden: false,
        sequenceNumber: 0
      },
      dialogFormVisible: false,
      rules: {
        type: [{ required: true, message: 'Type is required', trigger: 'blur' }],
        name: [{ required: true, message: 'Name is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listMenu().then(response => {
        const data = response.data
        this.list = data
        this.listLoading = false
      })
    },
    getChildren(row, treeNode, resolve) {
      listMenu(row.id).then(response => {
        const data = response.data
        data.forEach(element => {
          element.parent = row
        })
        row.children = data
        resolve(data)
      })
    },
    getType(parent) {
      if (parent) {
        switch (parent.type) {
          case 0:
            return 1
          case 1:
            return 2
        }
      }
      return 0
    },
    resetTemp(parent) {
      this.temp = {
        id: null,
        parentId: parent && parent.id,
        name: null,
        type: this.getType(parent),
        icon: null,
        path: null,
        componentName: null,
        componentPath: null,
        url: null,
        httpMethod: null,
        authority: null,
        hidden: false,
        sequenceNumber: 0
      }
    },
    handleCreate(parent) {
      this.resetTemp(parent)
      this.parent = parent
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createMenu(this.temp).then(response => {
            const data = response.data

            data.parent = this.parent
            if (this.parent) {
              if (this.parent.children) {
                this.parent.children.push(data)
              } else {
                this.parent.hasChildren = true
              }
            } else {
              this.list.push(data)
            }
            this.dialogFormVisible = false
            this.$notify(CREATE_SUCCESS)
          })
        }
      })
    },
    handleUpdate(row) {
      copy(this.temp, row) // copy obj
      this.parent = row.parent
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateMenu(this.temp).then(response => {
            const data = response.data

            data.parent = this.parent
            const list = this.parent ? this.parent.children : this.list
            const index = list.findIndex(v => v.id === this.temp.id)
            list.splice(index, 1, data)
            // TODO change parentId
            this.dialogFormVisible = false
            this.$notify(UPDATE_SUCCESS)
          })
        }
      })
    },
    handleDelete(row) {
      deleteMenu(row.id).then(() => {
        const list = row.parent ? row.parent.children : this.list
        const index = list.findIndex(v => v.id === row.id)
        list.splice(index, 1)
        if (list.length === 0 && row.parent) {
          row.parent.hasChildren = false
        }
        this.$notify(DELETE_SUCCESS)
      })
    }
  }
}
</script>
