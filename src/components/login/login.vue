<template>
  <div class="login-wrap">
    <el-form
      label-position="top"
      :rules="rules"
      ref="fromLogin"
      :model="fromDate"
      class="login-form"
    >
      <h1>用户登录</h1>
      <el-form-item label="用户名" class="login-label" prop="username">
        <el-input v-model="fromDate.username" class="login-input"></el-input>
      </el-form-item>
      <el-form-item label="密码" class="login-label" prop="password">
        <el-input v-model="fromDate.password" class="login-input" show-password></el-input>
      </el-form-item>
      <el-button type="primary" class="login-button" @click.prevent="handleLogin()">登陆</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fromDate: {},
      rules: {
        username: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 3, max: 16, message: "长度在 3 到 16 个字符", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "change" }]
      }
    };
  },
  methods: {
    handleLogin() {
      this.$refs["fromLogin"].validate(valid => {
        if (valid) {
          this.$MyHttp
            .post("login", this.fromDate)
            .then(res => {
              //对象解构
              const {
                meta: { status, msg },
                data
              } = res.data;
              if (status === 200) {
                this.fromDate = {};
                let token = data.token;
                localStorage.setItem("token", token);
                this.$message.success(msg);
                this.$router.push({ name: "home" });
              } else {
                this.$message.error(msg);
              }
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  }
};
</script>

<style>
h1 {
  font-size: 3rem;
  font-family: "华文行楷";
}
.login-label {
  font-size: 2rem;
  font-family: "华文行楷";
}
.login-wrap {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-form {
  width: 30%;
  height: 40%;
  padding: 4rem;
  background-color: rgb(250, 250, 250, 0.3);
  border-radius: 1rem;
}
.login-button {
  width: 100%;
}
</style>