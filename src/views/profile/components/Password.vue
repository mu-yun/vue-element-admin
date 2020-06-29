<template>
  <el-form ref="dataForm" :rules="rules" :model="temp">
    <el-form-item label="Old Password" prop="oldPassword">
      <el-input v-model="temp.oldPassword" show-password />
    </el-form-item>
    <el-form-item label="New Password" prop="newPassword">
      <el-input v-model="temp.newPassword" show-password />
    </el-form-item>
    <el-form-item label="Confirm Password" prop="confirmPassword">
      <el-input v-model="temp.confirmPassword" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Update</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { changePassword } from '../../../api/user'
import { UPDATE_SUCCESS } from '../../../utils/notification'

export default {
  data() {
    var validateNewPassword = (rule, value, callback) => {
      if (value === null || value === '') {
        callback(new Error('New password is required'))
      } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
        callback(new Error('New password must be alphanumeric'))
      } else if (!(value.length >= 6 && value.length <= 16)) {
        callback(new Error('New password length must be between 6 and 16'))
      } else {
        if (this.temp.confirmPassword !== '' && this.temp.confirmPassword !== null) {
          this.$refs['dataForm'].validateField('confirmPassword')
        }
        callback()
      }
    }
    var validateConfirmPassword = (rule, value, callback) => {
      if (this.temp.newPassword === null || this.temp.newPassword === '') {
        callback()
      } else if (value === null || value === '') {
        callback(new Error('Please input new password again'))
      } else if (value !== this.temp.newPassword) {
        callback(new Error('Two passwords don\'t match.Try again'))
      } else {
        callback()
      }
    }
    return {
      temp: {
        oldPassword: null,
        newPassword: null,
        confirmPassword: null
      },
      rules: {
        oldPassword: [{ required: true, message: 'Old password is required', trigger: 'blur' }],
        newPassword: [
          { validator: validateNewPassword, required: true, trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validateConfirmPassword, required: true, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          changePassword(this.temp).then(() => {
            this.$notify(UPDATE_SUCCESS)
            this.$refs['dataForm'].resetFields()
            console.log(this.temp)
            // this.$message({
            //   message: 'User information has been updated successfully',
            //   type: 'success',
            //   duration: 5 * 1000
            // })
          })
        }
      })
    }
  }
}
</script>
