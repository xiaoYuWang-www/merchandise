<template>
  <el-col class="userCard">
    <el-card shadow="always" class="userCard">
    <com-breadcrumb levelNameOne="用户管理" levelNameTwo="用户列表"></com-breadcrumb>
      <el-row class="search">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="search" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click.prevent="handelSearch()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="success" plain class="but" @click="$router.push({ name : 'goodsadd' })">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="tableData" v-loading="loading" border style="width: 100%" height="600px">
        <el-table-column prop="goods_id" label="#" width="100px"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="150px"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量" width="150px"></el-table-column>
        <el-table-column prop="add_time" label="创建日期" width="150px">
          <template slot-scope="scope">{{scope.row.add_time| fmtDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              plaindit
              size="mini"
              @click="$router.push({ path : `/goodsedit/${scope.row.goods_id}`})"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              plain
              size="mini"
              @click="handelDanger(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pap"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagenum"
        :page-sizes="[10,20,30]"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </el-col>
</template>

<script>
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      console.log(value);
      if (value === undefined) {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.formDate.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    return {
      tableData: [], //商品列表
      loading: true,
      roles: [], //角色列表
      pagenum: 1, //页码
      pagesize: 10, //页面总条数
      total: -1, //总条数
      search: "",
      addDialogFormVisible: false,
      formDate: {},
      formLabelWidth: "120px",
      editDialogFormVisible: false,
      roleDialogFormVisible: false,

      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "change" }
        ],
        validatePass: [
          { required: true, validator: validatePass, trigger: "blur" }
        ],
        email: [{ required: true, message: "请输入邮箱地址", trigger: "blur" }],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { min: 11, max: 11, message: "长度为11个字符", trigger: "blur" }
        ]
      }
    };
  },
  mounted() {
    this.userGet();
  },
  methods: {
    async userGet() {
      this.loading = true;
      //同步加载
      const res = await this.$MyHttp.get(
        `goods?query=${this.search}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      const {
        data,
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        this.tableData = data.goods;
        //分页的总条数
        this.total = data.total;
        this.$message.success(msg);
      } else {
        this.$message.error(msg);
      }
      this.loading = false;
    },
    handleSizeChange(val) {
      //页面条数发生改变时
      this.pagesize = val;
      this.userGet();
    },
    handleCurrentChange(val) {
      //当前页码发生改变时
      this.pagenum = val;
      this.userGet();
    },
    handelSearch() {
      this.pagenum = 1;
      this.userGet();
    },
    handelDanger(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$MyHttp.delete(`goods/${id}`).then(res => {
            const {
              data,
              meta: { status, msg }
            } = res.data;
            if (status === 200) {
              this.$message.success(msg);
              this.userGet();
            }
          });
        })
        .catch(() => {});
    },
    ShowDialog(type, ID) {
      if (type === "add") {
        this.addDialogFormVisible = true;
        this.formDate = {};
      } else {
        //根据ID查找数据
        this.$MyHttp
          .get("users/" + ID)
          .then(res => {
            this.formDate = res.data.data;
          })
          .catch(err => {
            console.error(err);
          });
        if (type === "edit") {
          this.editDialogFormVisible = true;
        } else {
          this.roleDialogFormVisible = true;
          //加载角色列表
          this.$MyHttp
            .get(`roles`)
            .then(res => {
              this.roles = res.data.data;
            })
            .catch(err => {
              console.error(err);
            });
        }
      }
    },
    addDialogForm() {
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          //设置状态
          this.formDate.mg_state = 1; //默认为可用
          this.$MyHttp
            .post("users", this.formDate)
            .then(res => {
              const {
                data,
                meta: { status, msg }
              } = res.data;
              if (status === 201) {
                this.$message.success(msg);
                this.addDialogFormVisible = false;
                this.formDate = {};
                this.userGet();
              }
            })
            .catch(err => {
              this.$message.err(msg);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    editDialogForm() {
      this.$refs["editForm"].validate(valid => {
        if (valid) {
          this.$MyHttp
            .put(`users/${this.formDate.id}`, this.formDate)
            .then(res => {
              const {
                data,
                meta: { status, msg }
              } = res.data;
              if (status === 200) {
                this.$message.success(msg);
                this.editDialogFormVisible = false;
                this.formDate = {};
                this.userGet();
              }
            })
            .catch(err => {
              this.$message.err(msg);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    roleDialogForm() {
      //分配角色
      this.$MyHttp
        .put(`users/${this.formDate.id}/role`, "rid=" + this.formDate.rid)
        .then(res => {
          const {
            data,
            meta: { status, msg }
          } = res.data;
          if (status === 200) {
            this.$message.success(msg);
            this.roleDialogFormVisible = false;
            this.formDate = {};
            this.userGet();
          } else {
            this.$message.error(msg);
          }
        })
    },
    DialogClose(type) {
      if (type === "add") {
        this.addDialogFormVisible = false;
        this.$refs["ruleForm"].resetFields();
      } else if (type === "edit") {
        this.editDialogFormVisible = false;
      } else {
        this.roleDialogFormVisible = false;
      }
    }
  }
};
</script>

<style scoped>
.userCard {
  height: 100%;
}
.search {
  margin: 20px 0px;
}
.but {
  margin-left: 20px;
}
.pap {
  text-align: center;
  margin: 60px 0px;
}
</style>