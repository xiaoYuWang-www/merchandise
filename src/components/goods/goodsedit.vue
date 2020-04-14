<template>
  <el-card shadow="always" class="card">
    <com-breadcrumb levelNameOne="商品管理" levelNameTwo="修改商品"></com-breadcrumb>
    <el-alert title="添加商品信息" type="success" center show-icon></el-alert>
    <!--步骤条-->
    <el-steps :active="active*1" align-center class="steps" finish-status="success">
      <el-step title="商品信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
    </el-steps>
    <!--标签页-->
    <el-form :model="fromDate" label-position="top" label-width="80px">
      <el-tabs
        v-model="active"
        tab-position="left"
        class="tabs"
        @tab-click="handleClick()"
        :before-leave="handelOpen"
      >
        <el-tab-pane label="商品信息" name="1">
          <el-form-item label="商品名称">
            <el-input v-model="fromDate.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="fromDate.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="fromDate.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="fromDate.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-cascader :options="options" clearable :props="defaultProps" v-model="optionsValue"></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="2">
          <el-form-item
            :label="param.attr_name"
            v-for="(param , index) in arrgDyParms"
            :key="index"
          >
            <el-checkbox :label="val" border v-for="(val , index) in param.attr_vals" :key="index"></el-checkbox>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="3">
          <el-form-item
            :label="param.attr_name"
            v-for="(param , index) in arrgStaticsParams"
            :key="index"
          >
            <el-input v-model="param.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="4">
          <el-form-item label="请选择上传的图片">
            <el-upload
              action="http://localhost:8888/api/private/v1/upload"
              list-type="picture-card"
              :before-upload="beforeAvatarUpload"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="handlePictureSuccess"
              :headers="headers"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt />
            </el-dialog>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="5">
          <el-form-item label="商品内容">
            <quill-editor v-model="fromDate.goods_introduce"></quill-editor>
          </el-form-item>
          <el-button type="primary" @click="handelAddGoods()">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";

export default {
  data() {
    return {
      active: "1",
      fromDate: {
        //添加表单
        goods_id : '',
        goods_name: "",
        goods_cat: "",
        goods_price: "",
        goods_number: "",
        goods_weight: "",
        goods_introduce: "",
        pics: [],
        attrs: []
      },
      options: [], //分类商品
      defaultProps: {
        //级联列表默认属性
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      optionsValue: [1, 3, 6], //绑定选中值
      arrgDyParms: [], //动态参数
      arrgStaticsParams: [], //静态参数
      dialogImageUrl: "", //上传后显示的地址
      dialogVisible: false, //控制图片显示
      headers: {
        //设置上传请求头
        Authorization : localStorage.getItem("token")
      }
    };
  },
  components: {
    quillEditor
  },
  mounted() {
    this.lodaDateCategory();

    let goodsId =this.$route.params.id
    this.$MyHttp.get(`goods/${goodsId}`).then(res=>{
        let goods = res.data.data
        this.fromDate = goods
        this.optionsValue = goods.goods_cat.split(',').map(item=>parseInt(item))
    })
  },
  methods: {
    async lodaDateCategory() {
      //三级分类
      const res = await this.$MyHttp.get(`categories?type=3`);
      this.options = res.data.data;
    },
    async handleClick() {
      if (this.active === "2") {
        //商品参数被选中
        //根据ID发送请求得到  商品的动态参数
        const res = await this.$MyHttp.get(
          `categories/${this.optionsValue[2]}/attributes?sel=many`
        );
        this.arrgDyParms = res.data.data;
        this.arrgDyParms.forEach(param => {
          param.attr_vals = param.attr_vals.trim().split(",");
        });
      } else if (this.active === "3") {
        //商品属性被选中
        //根据ID发送请求得到  商品的静态参数
        const res = await this.$MyHttp.get(
          `categories/${this.optionsValue[2]}/attributes?sel=only`
        );
        this.arrgStaticsParams = res.data.data;
      }
    },
    handelOpen() {
      if (this.active !== 1 && this.optionsValue.length !== 3) {
        this.$message.warning("请选择分类信息");
        return false;
      }
    },
    handlePictureSuccess(file) {
      //文件上传成功时
      this.fromDate.pics.push({ pic: file.data.tmp_path });
      console.log(file);
    },
    handleRemove(file) {
      //文件列表移除文件时
      this.fromDate.pics.map((item, index) => {
        if (item.pic === file.response.data.tmp_path) {
          this.fromDate.pics.splice(index, 1);
        }
      });
    },
    handlePictureCardPreview(file) {
      //点击文件列表中已上传的文件时
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    beforeAvatarUpload(file) {
      //约束  // （类型/大小）
      const isJPG =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    async handelAddGoods() {
      this.fromDate.goods_cat = this.optionsValue.join(",");
      let arrOne = this.arrgDyParms.map(item=>{
          return {'attr_id':item.attr_id ,'attr_vals':item.attr_vals.join(',')}
      })
      let arrTwo = this.arrgStaticsParams.map(item=>{
          return {'attr_id':item.attr_id ,'attr_vals':item.attr_vals}
      })
      this.fromDate.attrs = [...arrOne , ...arrTwo]
      
      let res = await this.$MyHttp.post(`goods`,this.fromDate)
      /* console.log(this.fromDate) */
      const {meta: { msg, status}} = res.data;
      if(status === 201){
        this.$message.success(msg);
        this.$router.push({name :'goods'})
      }else{
        this.$message.error(msg)
      }
     
    }
  }
};
</script>
<style>
.steps {
  margin: 30px 0px;
}
.card {
  height: 100%;
}
.ql-editor {
  height: 500px;
}
</style>