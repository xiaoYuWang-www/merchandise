<template>
  <el-col class="userCard">
    <el-card shadow="always" class="userCard">
      <com-breadcrumb levelNameOne="商品管理" levelNameTwo="商品分类"></com-breadcrumb>

      <el-button type="success" plain class="but" @click="handelShowDialog">添加分类</el-button>

      <el-table :data="tableData" v-loading="loading" border style="width: 100%" height="600px">
        <!--<el-table-column prop="cat_name" label="分类名称"></el-table-column>-->
        <el-tree-grid
          levelKey="cat_level"
          treeKey="cat_id"
          parentKey="cat_pid"
          childKey="children"
          file-icon="icon icon-file"
          folder-icon="icon icon-folder"
          prop="cat_name"
          label="分类名称"
          width="220"
        >></el-tree-grid>
        <el-table-column label="级别">
          <template slot-scope="scope">
            <span v-if="scope.row.cat_level === 0">一级</span>
            <span v-else-if="scope.row.cat_level === 1">二级</span>
            <span v-else-if="scope.row.cat_level === 2">三级</span>
          </template>
        </el-table-column>
        <el-table-column label="是否有效" width="300px">
          <template slot-scope="scope">{{scope.row.cat_deleted?'无效':'有效'}}</template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              plaindit
              size="mini"
              @click="handelEdit(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              plain
              size="mini"
              @click="handelDanger(scope.row.cat_id)"
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

      <!--添加对话框-->
      <el-dialog title="添加商品分类" :visible.sync="DialogFormVisible" :close-on-press-escape="true">
        <el-form :model="formDate">
          <el-form-item label="分类名称" :label-width="formLabelWidth">
            <el-input v-model="formDate.cat_name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="分类" :label-width="formLabelWidth">
            <el-cascader
              clearable
              :options="options"
              v-model="selectedOptions"
              :props="defaultProps"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="DialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="handelDaddCate()">确 定</el-button>
        </div>
      </el-dialog>

      <!--修改对话框-->
      <el-dialog title="修改商品分类" :visible.sync="editDialogFormVisible" :close-on-press-escape="true">
        <el-form :model="formDate">
          <el-form-item label="分类名称" :label-width="formLabelWidth">
            <el-input v-model="formDate.cat_name" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="handelEditCate()">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </el-col>
</template>

<script>
var ElTreeGrid = require("element-tree-grid");

export default {
  data() {
    return {
      tableData: [], //商品列表
      loading: true,
      roles: [], //角色列表
      pagenum: 1, //页码
      pagesize: 10, //页面总条数
      total: -1, //总条数
      DialogFormVisible: false,
      editDialogFormVisible: false,
      formLabelWidth: "120px",
      options: [], //分类列表
      selectedOptions: [],
      defaultProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      formDate: {
        cat_pid: "",
        cat_name: "",
        cat_level: ""
      }
    };
  },
  mounted() {
    this.userGet();
  },
  components: {
    ElTreeGrid
  },
  methods: {
    handelEdit(cat) {
      this.editDialogFormVisible = true;
      this.formDate = {
        cat_id: cat.cat_id,
        cat_name: cat.cat_name
      };
    },
    //修改
    async handelEditCate(id) {
      const res = await this.$MyHttp.put(`categories/${this.formDate.cat_id}`, this.formDate);
      const {
        data,
        meta: { status, msg }
      } = res.data;
      if (status === 200) {
        this.userGet();
        this.editDialogFormVisible = false;
        this.formDate = {
          cat_id: "",
          cat_name: "",
        };
      }
    },
    //添加分类信息
    async handelDaddCate() {
      if (this.selectedOptions.length === 0) {
        this.formDate.cat_pid = 0;
        this.formDate.cat_level = 0;
      } else if (this.selectedOptions.length === 1) {
        this.formDate.cat_pid = this.selectedOptions[0];
        this.formDate.cat_level = 1;
      } else if (this.selectedOptions.length === 2) {
        this.formDate.cat_pid = this.selectedOptions[1];
        this.formDate.cat_level = 2;
      }
      const res = await this.$MyHttp.post(`categories`, this.formDate);
      const {
        data,
        meta: { status, msg }
      } = res.data;
      if (status === 201) {
        this.userGet();
        this.DialogFormVisible = false;
        this.formDate = {
          cat_pid: "",
          cat_name: "",
          cat_level: ""
        };
      }
    },
    async handelShowDialog() {
      this.DialogFormVisible = true;

      const res = await this.$MyHttp.get(`categories?type=2  `);
      this.options = res.data.data;
    },
    async userGet() {
      this.loading = true;
      //同步加载
      const res = await this.$MyHttp.get(
        `categories?type=3&query=${this.search}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      const {
        data,
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        this.tableData = data.result;
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
    //删除
    handelDanger(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$MyHttp.delete(`categories/${id}`).then(res => {
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
    }
  }
};
</script>

<style scoped>
.userCard {
  height: 100%;
}
.but {
  margin-bottom: 20px;
}
.pap {
  text-align: center;
  margin: 60px 0px;
}
</style>