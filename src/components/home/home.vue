<template>
  <div class="box">
    <el-container class="container">
      <el-header class="header">
        <el-row>
          <el-col :span="20">
            <h2>管理系统</h2>
          </el-col>
          <el-col :span="4">
            <a class="logout" @click.prevent="handleExit()">退出</a>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside width="200px" class="aside">
          <el-menu :unique-opened="true" :router="true">
            <el-submenu :index="index+''" v-for="(item,index) in menus" :key="index">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{item.authName}}</span>
              </template>
              <el-menu-item :index="'/'+itemOne.path" v-for="(itemOne,index) in item.children" :key="index">
                <i class="el-icon-s-data"></i>{{itemOne.authName}}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menus : []
    }
  },
  //对象初始化前  验证用户是否登陆
  /* beforeCreate() {
    let token = localStorage.getItem("token");
    if (!token) {
      this.$message.warning("请先登录");
      this.$router.push({ name: "login" });
    }
  }, */
  created() {
    this.$MyHttp
      .get("menus")
      .then(res => {
         this.menus = res.data.data
      })
      .catch(err => {
        console.error(err);
      });
  },
  methods: {
    handleExit() {
      localStorage.removeItem("token");
      this.$router.push({ name: "login" });
      this.$message.success("退出成功");
    }
  }
};
</script>

<style>
.box,
.container {
  height: 100%;
  width: 100%;
}
.header {
  background: #b3c0de;
}
.aside {
  background: white;
}
.main {
  background: #e9eef3;
}
h2 {
  font-size: 3rem;
  font-family: "华文行楷";
  text-align: center;
  line-height: 60px;
}
.logout {
  font-size: 2rem;
  font-family: "华文行楷";
  text-align: center;
  line-height: 60px;
}
</style>