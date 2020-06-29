<template>
  <el-form ref="dataForm" :rules="rules" :model="temp">
    <el-form-item label="Name">
      <el-input v-model="temp.name" />
    </el-form-item>
    <el-form-item label="Phone Number" prop="phoneNumber">
      <el-input v-model="temp.phoneNumber" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :disabled="unchanged" @click="submit">Update</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { changeUserInfo } from '../../../api/user'
import { UPDATE_SUCCESS } from '../../../utils/notification'
import { mapMutations } from 'vuex'
import { copy } from '../../../utils/object'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          phoneNumber: ''
        }
      }
    }
  },
  data() {
    return {
      temp: {
        name: this.user.name,
        phoneNumber: this.user.phoneNumber
      },
      rules: {
        phoneNumber: [
          {
            pattern: /^1[0-9]{10}$/,
            message: 'Incorrect phone number',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    unchanged: function() {
      return (
        this.user.name === this.temp.name &&
        this.user.phoneNumber === this.temp.phoneNumber
      )
    }
  },
  methods: {
    ...mapMutations({
      setName: 'user/SET_NAME',
      setPhoneNumber: 'user/SET_PHONE_NUMBER'
    }),
    submit() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          changeUserInfo(this.temp).then(() => {
            copy(this.user, this.temp)
            this.setName(this.temp.name)
            this.setPhoneNumber(this.temp.phoneNumber)
            this.$notify(UPDATE_SUCCESS)
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
