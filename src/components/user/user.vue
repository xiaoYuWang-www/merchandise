<template>
  <el-col class="userCard">
    <el-card shadow="always" class="userCard">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-row class="search">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="search" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click.prevent="handelSearch()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="success" plain class="but" @click="ShowDialog('add')">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="tableData" v-loading="loading" border style="width: 100%">
        <el-table-column prop="id" label="#" width="100px"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="create_time" label="创建日期">
          <template slot-scope="scope">{{scope.row.create_time | fmtDate}}</template>
        </el-table-column>
        <el-table-column label="用户状态" width="100px">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handelState(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              plain
              size="mini"
              @click="ShowDialog('edit',scope.row.id)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-check"
              circle
              plain
              size="mini"
              @click="ShowDialog('role',scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              plain
              size="mini"
              @click="handelDanger(scope.row.id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pap"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagenum"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!--添加-->
      <el-dialog title="添加用户" :visible.sync="addDialogFormVisible" :close-on-press-escape="true">
        <el-form :model="formDate" :rules="rules" ref="ruleForm" status-icon>
          <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
            <el-input v-model="formDate.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
            <el-input v-model="formDate.password" show-password></el-input>
          </el-form-item>
          <el-form-item label="确认密码" :label-width="formLabelWidth" prop="validatePass">
            <el-input v-model="formDate.validatePass" show-password></el-input>
          </el-form-item>
          <el-form-item label="邮箱" :label-width="formLabelWidth" prop="email">
            <el-input v-model="formDate.email" type="email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" :label-width="formLabelWidth" prop="mobile">
            <el-input v-model="formDate.mobile"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="DialogClose('add')">取 消</el-button>
          <el-button type="primary" @click="addDialogForm()">确 定</el-button>
        </div>
      </el-dialog>
      <!--编辑-->
      <el-dialog title="编辑用户" :visible.sync="editDialogFormVisible" :close-on-press-escape="true">
        <el-form :model="formDate" :rules="rules" ref="editForm" status-icon>
          <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
            <el-input v-model="formDate.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" :label-width="formLabelWidth" prop="email">
            <el-input v-model="formDate.email" type="email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" :label-width="formLabelWidth" prop="mobile">
            <el-input v-model="formDate.mobile"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="DialogClose('edit')">取 消</el-button>
          <el-button type="primary" @click="editDialogForm()">确 定</el-button>
        </div>
      </el-dialog>
      <!--角色-->
      <el-dialog title="角色授权" :visible.sync="roleDialogFormVisible" :close-on-press-escape="true">
        <el-form :model="formDate">
          <el-form-item label="用户名" :label-width="formLabelWidth">{{formDate.username}}</el-form-item>
          <el-form-item label="角色" :label-width="formLabelWidth">
            <el-select v-model="formDate.rid" placeholder="请选择">
              <el-option
                v-for="item in roles"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="DialogClose('role')">取 消</el-button>
          <el-button type="primary" @click="roleDialogForm()">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </el-col>
</template>

<script>
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === undefined) {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.formDate.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    return {
      tableData: [], //用户列表
      loading: true,
      roles: [], //角色列表
      pagenum: 1, //页码
      pagesize: 2, //页面总条数
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
        `users?query=${this.search}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      const {
        data,
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        this.tableData = data.users;
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
    handelState(user) {
      this.$MyHttp
        .put(`users/${user.id}/state/${user.mg_state}`)
        .then(res => {
          const {
            data,
            meta: { status, msg }
          } = res.data;
          if (status === 200) {
            this.$message.success(msg);
          }
        })
        .catch(err => {
          this.$message.error(msg);
        });
    },
    handelDanger(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$MyHttp.delete(`users/${id}`).then(res => {
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
  margin: 40px 0px;
}
</style>