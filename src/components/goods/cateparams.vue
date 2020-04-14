<template>
  <el-col class="userCard">
    <el-card shadow="always" class="userCard">
      <com-breadcrumb levelNameOne="商品管理" levelNameTwo="分类参数"></com-breadcrumb>
      <el-alert title="只允许三级分类设置" type="error" class="alert"></el-alert>
      <span>商品分类 :</span>
      <el-cascader
        @change="handelChange()"
        :options="options"
        clearable
        :props="defaultProps"
        v-model="optionsValue"
      ></el-cascader>
      <el-tabs type="border-card" v-model="active" class="tabs">
        <el-tab-pane label="动态参数" name="1">
          <el-button type="danger" @click="dialogFormVisibleDy=true">设置动态参数</el-button>
          <el-table :data="arrgDyParms" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="tag"
                  v-for="(tag,i) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(i,scope.row)"
                >{{tag}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" prop="attr_id"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  circle
                  size="mini"
                  @click="handelDyShow(scope.row)"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  size="mini"
                  @click="handelDyDel(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="2">
          <el-button type="danger" @click="dialogFormVisibleSt=true">设置静态参数</el-button>
          <el-table :data="arrgStaticsParams" style="width: 100%">
            <el-table-column label="#" prop="attr_id"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="参数值" prop="attr_vals"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="handelStShow(scope.row)"></el-button>
                <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="handelStDel(scope.row.attr_id)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!--动态参数对话框-->
      <el-dialog
        :title="(isDyEdit?'修改':'添加')+'动态参数'"
        :visible.sync="dialogFormVisibleDy"
        @closed="handelDialogClose()"
      >
        <el-form :model="formDyDate">
          <el-form-item label="参数名称">
            <el-input v-model="formDyDate.attr_name" :label-width="formLabelWidth"></el-input>
          </el-form-item>
          <el-form-item label="参数属性">
            <el-input
              v-model="formDyDate.attr_vals"
              :label-width="formLabelWidth"
              placeholder="以 “ , ” 分割"
            ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisibleDy = false">取 消</el-button>
          <el-button type="primary" @click="handelAddDyParams()">确 定</el-button>
        </div>
      </el-dialog>

      <!--静态参数对话框-->
      <el-dialog
        :title="(isStEdit?'修改':'添加')+'静态参数'"
        :visible.sync="dialogFormVisibleSt"
        @closed='handelDialogCloseSt()'
      >
        <el-form :model="formStDate">
          <el-form-item label="参数名称">
            <el-input v-model="formStDate.attr_name" :label-width="formLabelWidth"></el-input>
          </el-form-item>
          <el-form-item label="参数属性">
            <el-input
              v-model="formStDate.attr_vals"
              :label-width="formLabelWidth"
            ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisibleSt = false">取 消</el-button>
          <el-button type="primary" @click="handelAddStParams()">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </el-col>
</template>

<script>
export default {
  data() {
    return {
      inputVisible: false,
      inputValue: "",
      active: "1",
      options: [], //分类商品
      defaultProps: {
        //级联列表默认属性
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      optionsValue: [], //绑定选中值
      arrgDyParms: [], //动态参数
      arrgStaticsParams: [], //静态参数
      dialogFormVisibleDy: false,
      dialogFormVisibleSt: false,
      formStDate:{
        attr_name: "",
        attr_sel: "only",
        attr_vals: ""
      },
      formDyDate: {
        attr_name: "",
        attr_sel: "many",
        attr_vals: ""
      },
      formLabelWidth: "120px",
      isDyEdit: false,
      isStEdit: false,
      
    };
  },
  mounted() {
    this.lodaDateCategory();
  },
  methods: {
    async lodaDateCategory() {
      //三级分类
      const res = await this.$MyHttp.get(`categories?type=3`);
      this.options = res.data.data;
    },
    async lodaDyParamsDate() {
      //动态参数
      let res = await this.$MyHttp.get(
        `categories/${this.optionsValue[2]}/attributes?sel=many`
      );
      this.arrgDyParms = res.data.data;
      this.arrgDyParms.forEach(param => {
        param.attr_vals =
          param.attr_vals.trim().split(",").length === 0
            ? []
            : param.attr_vals.trim().split(",");
      });
    },
    async lodaStParamsDate() {
      //静态参数
      //根据ID发送请求得到  商品的静态参数
      let res = await this.$MyHttp.get(
        `categories/${this.optionsValue[2]}/attributes?sel=only`
      );
      this.arrgStaticsParams = res.data.data;
    },
    //当三级分类改变时
    async handelChange() {
      if (this.optionsValue.length === 3) {
        this.lodaDyParamsDate();
        this.lodaStParamsDate();
      }else{
        this.$message.error('请先选着分类信息')
      }
    },
    handleClose(i, params) {
      //删除标签

      //当动态参数attr_vals移除要删除的属性
      params.attr_vals.splice(i, 1);
      //将数组还原成字符串
      const putData = {
        attr_name: params.attr_name,
        attr_sel: params.attr_sel,
        attr_vals: params.attr_vals.join(",")
      };
      this.$MyHttp
        .put(
          `categories/${params.cat_id}/attributes/${params.attr_id}`,
          putData
        )
        .then(res => {
          if (res.status === 200) {
            this.$message.success("删除成功");
          }
        });
    },
    showInput() {
      //添加标签
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm(params) {
      //处理添加标签 （回车，失去焦点）
      let inputValue = this.inputValue;
      if (inputValue) {
        params.attr_vals.push(inputValue);
        const putData = {
          attr_name: params.attr_name,
          attr_sel: params.attr_sel,
          attr_vals: params.attr_vals.join(",")
        };
        this.$MyHttp
          .put(
            `categories/${params.cat_id}/attributes/${params.attr_id}`,
            putData
          )
          .then(res => {
            if (res.status === 200) {
              this.$message.success("添加成功");
            }
          });
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    //添加或修改动态参数
    async handelAddDyParams() {
      if (this.optionsValue.length === 3) {
        if (this.isDyEdit) {
          //修改
          let res = await this.$MyHttp.put(
            `categories/${this.optionsValue[2]}/attributes/${this.formDyDate.attr_id}`,
            this.formDyDate
          );
          if (res.data.meta.status === 200) {
            this.lodaDyParamsDate();
          }
        } else {
          //添加
          let res = await this.$MyHttp.post(
            `categories/${this.optionsValue[2]}/attributes`,
            this.formDyDate
          );
          if (res.data.meta.status === 201) {
            this.lodaDyParamsDate();
          }
        }
        this.dialogFormVisibleDy = false;
      }
    },
    //删除动态
    async handelDyDel(DyID) {
      let res = await this.$MyHttp.delete(
        `categories/${this.optionsValue[2]}/attributes/${DyID}`,
        this.formDyDate
      );
      if (res.data.meta.status === 200) {
        this.lodaDyParamsDate();
        this.$message.success("删除成功");
      }
    },
    //显示动态修改对话框
    async handelDyShow(Dy) {
      //修改标识符
      this.isDyEdit = "true";
      this.dialogFormVisibleDy = true;
      this.formDyDate = {
        attr_id: Dy.attr_id,
        attr_name: Dy.attr_name,
        attr_sel: "many",
        attr_vals: Dy.attr_vals.length === 0 ? "" : Dy.attr_vals.join(",")
      };
    },
    //关闭动态对话框
    handelDialogClose() {
      this.isDyEdit = false;
      this.formDyDate = {
        attr_id: "",
        attr_name: "",
        attr_sel: "many",
        attr_vals: ""
      }
    },
    //添加静态
    async handelAddStParams(){
       if (this.optionsValue.length === 3) {
        if (this.isStEdit) {
          //修改
          let res = await this.$MyHttp.put(
            `categories/${this.optionsValue[2]}/attributes/${this.formStDate.attr_id}`,
            this.formStDate
          );
          if (res.data.meta.status === 200) {
            this.lodaStParamsDate();
          }
        } else {
          //添加
          let res = await this.$MyHttp.post(
            `categories/${this.optionsValue[2]}/attributes`,
            this.formStDate
          );
          if (res.data.meta.status === 201) {
            this.lodaStParamsDate();
          }
        }
        this.dialogFormVisibleSt = false;
      }else{
        this.$message.error('请先选着分类信息')
      }
    },
    //显示静态修改对话框
    async handelStShow(St) {
      //修改标识符
      this.isStEdit = "true";
      this.dialogFormVisibleSt = true;
      this.formStDate = {
        attr_id: St.attr_id,
        attr_name: St.attr_name,
        attr_sel: "only",
        attr_vals: St.attr_vals
      };
    },
    //关闭静态对话框
    handelDialogCloseSt() {
      this.isStEdit = false;
      this.formStDate = {
        attr_id: "",
        attr_name: "",
        attr_sel: "only",
        attr_vals: ""
      }
    },
    //删除静态
    async handelStDel(StID) {
      let res = await this.$MyHttp.delete(
        `categories/${this.optionsValue[2]}/attributes/${StID}`,
        this.formStDate
      );
      if (res.data.meta.status === 200) {
        this.lodaStParamsDate();
        this.$message.success("删除成功");
      }
    },
  }
};
</script>   

<style>
.userCard {
  height: 100%;
}
.alert {
  margin-bottom: 10px;
}
.tabs {
  margin-top: 15px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>