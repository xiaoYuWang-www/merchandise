<template>
  <el-card shadow="always" class="userCard">
    <com-breadcrumb levelNameOne="权限管理" levelNameTwo="角色列表"></com-breadcrumb>
    <el-button plain @click="ShowDialog('add')">添加角色</el-button>
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row v-for="(itemOne, index) in scope.row.children" :key="index">
            <el-col :span="3">
              <el-tag @close="handleTagClose(scope.row,itemOne.id)" closable>{{itemOne.authName}}</el-tag>
            </el-col>
            <el-col :span="21">
              <el-row v-for="(itemTwo, index) in itemOne.children" :key="index">
                <el-col :span="3">
                  <el-tag
                    @close="handleTagClose(scope.row,itemTwo.id)"
                    closable
                    type="success"
                  >{{itemTwo.authName}}</el-tag>
                </el-col>
                <el-col :span="21">
                  <el-tag
                    @close="handleTagClose(scope.row,itemThree.id)"
                    type="warning"
                    closable 
                    v-for="(itemThree, index) in itemTwo.children"
                    :key="index"
                  >{{itemThree.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <p v-if="scope.row.children.length === 0" class="nodata">权限不足</p>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="#"></el-table-column>
      <el-table-column prop="roleName" label="主管"></el-table-column>
      <el-table-column prop="roleDesc" label="技术负责人"></el-table-column>
      <el-table-column label="操作">
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
            @click="handelShowDis(scope.row)"
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
    <!--添加角色-->
    <el-dialog title="添加角色" :visible.sync="addDialogFormVisible">
      <el-form :model="formDate" :rules="rules" ref="ruleForm">
        <el-form-item label="角色名称" :label-width="formLabelWidth" prop="roleName">
          <el-input v-model="formDate.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" :label-width="formLabelWidth" prop="roleDesc">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            v-model="formDate.roleDesc"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="DialogClose('add')">取 消</el-button>
        <el-button type="primary" @click="roleDialogForm()">确 定</el-button>
      </div>
    </el-dialog>
    <!--编辑角色-->
    <el-dialog title="编辑角色" :visible.sync="editDialogFormVisible">
      <el-form :model="formDate" :rules="rules" ref="editForm">
        <el-form-item label="角色名称" :label-width="formLabelWidth" prop="roleName">
          <el-input v-model="formDate.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" :label-width="formLabelWidth" prop="roleDesc">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            v-model="formDate.roleDesc"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="DialogClose('edit')">取 消</el-button>
        <el-button type="primary" @click="editDialogForm()">确 定</el-button>
      </div>
    </el-dialog>

    <!--分配角色-->
    <el-dialog title="分配角色" :visible.sync="disDialogFormVisible" @open="handelDis()" @close="handelDisClose()">
      <el-tree
        v-loading="loading"
        :default-checked-keys="checkedList"
        :data="dataDis"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="tree"
        highlight-current
        :props="defaultProps"
      ></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="disDialogFormVisible=false">取 消</el-button>
        <el-button type="primary" @click="handelDialogDis()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      dataDis: [],  
      tableData: [],   
      checkedList : [], //选中角色权限列表
      currentRoleID : [], //要操作的角色ID
      loading: true,
      addDialogFormVisible: false,
      editDialogFormVisible: false,
      disDialogFormVisible: false,
      formLabelWidth: "120px",
      formDate: {},
      defaultProps: {   //树状结构
        children: "children", //子元素集合名称
        label: "authName" //显示数状菜单名称
      },
      rules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 15, message: "长度在 2 到 15 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "change" }
        ]
      }
    };
  },
  mounted() {
    this.rolesGet();
  },
  methods: {
    async rolesGet() {
      this.loading = true;
      const res = await this.$MyHttp.get("roles");
      const {
        data,
        meta: { status, msg }
      } = res.data;
      if (status === 200) {
        this.tableData = data;
        this.$message.success(msg);
      } else {
        this.$message.error(msg);
      }
      this.loading = false;
    },
    handleTagClose(role, rightId) {
      this.$confirm("是否删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$MyHttp
          .delete(`roles/${role.id}/rights/${rightId}`)
          .then(res => {
            const {
              data,
              meta: { status, msg }
            } = res.data;
            if (status === 200) {
              this.$message.success(msg);
              role.children = data;
            } else {
              this.$message.error(msg);
            }
          })
          .catch(err => {
            console.error(err);
          });
      });
    },
    ShowDialog(type, ID) {
      if (type === "add") {
        this.addDialogFormVisible = true;
        this.formDate = {};
      } else {
        this.editDialogFormVisible = true;
        this.$MyHttp
          .get(`roles/${ID}`)
          .then(res => {
            const {
              data,
              meta: { status, msg }
            } = res.data;
            if (status === 200) {
              this.formDate = data;
            } else {
              this.$message.error(msg);
            }
          })
          .catch(err => {
            console.error(err);
          });
      }
    },
    roleDialogForm() {
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          this.$MyHttp
            .post(`roles`, this.formDate)
            .then(res => {
              const {
                data,
                meta: { status, msg }
              } = res.data;
              if (status === 201) {
                this.addDialogFormVisible = false;
                this.$message.success(msg);
                this.$refs["ruleForm"].resetFields();
                this.rolesGet();
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
    },
    DialogClose(type) {
      if (type === "add") {
        this.addDialogFormVisible = false;
        this.$refs["ruleForm"].resetFields();
        this.formDate = {};
      } else if (type === "edit") {
        this.editDialogFormVisible = false;
        this.$refs["ruleForm"].resetFields();
        this.formDate = {};
      }
    },
    handelDanger(ID) {
      this.$confirm("是否删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$MyHttp
          .delete(`roles/${ID}`)
          .then(res => {
            const {
              data,
              meta: { status, msg }
            } = res.data;
            if (status === 200) {
              this.$message.success(msg);
              this.rolesGet();
            } else {
              this.$message.error(msg);
            }
          })
          .catch(err => {
            console.error(err);
          });
      });
    },
    editDialogForm() {
      this.$MyHttp
        .put(`roles/${this.formDate.roleId}`, this.formDate)
        .then(res => {
          const {
            data,
            meta: { status, msg }
          } = res.data;
          if (status === 200) {
            this.editDialogFormVisible = false;
            this.$message.success(msg);
            this.$refs["editForm"].resetFields();
            this.formDate = {};
            this.rolesGet();
          } else {
            this.$message.error(msg);
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    handelShowDis(role) {
      //遍历对象，获取当前默认角色所属权限
      //清除之前保存的数组
      this.currentRoleID = role.id
      this.disDialogFormVisible = true
      this.checkedList = []
      role.children.forEach(itemOne=>{
        itemOne.children.forEach(itemTwo=>{
          itemTwo.children.forEach(itemThree=>{
            this.checkedList.push(itemThree.id)
          })
        })
      })
    },
    async handelDis() {
      //对话框弹出获取
      this.loading = true
      const res = await this.$MyHttp
        .get(`rights/tree`)
          const {
            data,
            meta: { status, msg }
          } = res.data;
          if (status === 200) {
            this.dataDis = res.data.data;
          } else {
            this.$message.error(msg);
          }
          this.loading = false;
    },
     async handelDialogDis(){
      //获取全选ID集合
       let arrOne = this.$refs.tree.getCheckedKeys()
       //获取半选ID集合
       let arrTwo = this.$refs.tree.getHalfCheckedKeys()
       //合并数组  ...Es6 提供的展开运算符
       let checks = [...arrOne,...arrTwo]
       let res = await this.$MyHttp.post(`roles/${this.currentRoleID}/rights`,'rids='+checks.join(','))
       const { data, meta: { status, msg } } = res.data;
       if(status===200){
         this.$message.success(msg)
         this.rolesGet()
       }else{
         this.$message.error(msg)
       }
       this.disDialogFormVisible = false
  },
  handelDisClose(){
    this.dataDis = []
    this.checkedList = []
  }
  }
};
</script>   

<style>
.el-tag {
  margin: 5px 0px;
}
.nodata {
  font-size: 1.7rem;
  color: #c0c4cc;
  text-align: center;
}
</style>