<template>
  <el-col class="userCard">
    <el-card shadow="always" class="userCard">
      <el-table :data="tableData" style="width: 100%" class="table" height="700px">
        <el-table-column prop="order_id" label="#" width="100"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | fmtDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              plaindit
              size="mini"
              @click="handelShowEdit(scope.row.order_id)"
            ></el-button>
            <el-button type="danger" icon="el-icon-delete" circle plain size="mini"></el-button>
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

      <!--编辑-->
      <el-dialog title="编辑订单" :visible.sync="dialogFormVisible" :before-close="handleCloseDislog">
        <el-form :model="formDate">
          <el-form-item label="订单号" :label-width="formLabelWidth">{{formDate.order_number}}</el-form-item>
          <el-form-item label="是否发货" :label-width="formLabelWidth">
            <el-switch
              v-model="formDate.is_send"
              active-value="是"
              inactive-value="否"
              active-color="#13ce66"
              inactive-color="#ff4949"
            ></el-switch>
          </el-form-item>
          <el-form-item label="订单支付" :label-width="formLabelWidth">
            <el-radio-group v-model="formDate.order_pay">
              <el-radio :label="0">未支付</el-radio>
              <el-radio :label="1">支付宝</el-radio>
              <el-radio :label="2">微信</el-radio>
              <el-radio :label="3">银行卡</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="订单价格" :label-width="formLabelWidth">
            <el-input v-model="formDate.order_price" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="送货地址" :label-width="formLabelWidth">
            <el-cascader v-model="selectOptions" :options="options" clearable></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" :label-width="formLabelWidth">
            <el-input v-model="formDate.address" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="handelEdit()">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </el-col>
</template>

<script>
//导入地址
import { regionDataPlus, CodeToText } from "element-china-area-data";

export default {
  data() {
    return {
      tableData: [], //订单列表
      loading: true,
      pagenum: 1, //页码
      pagesize: 12, //页面总条数
      total: -1, //总条数
      dialogFormVisible: false,
      formLabelWidth: "120px",
      formDate: {
       /*  order_id: 0,
        order_number: "",
        order_price: 0,
        order_pay: 0,
        is_send: 0,
        consignee_addr: "",
        pay_status: 0,
        adderss : '' */
      },
      selectOptions: [],
      options: regionDataPlus
    };
  },
  mounted() {
    this.GetOrders();
  },
  methods: {
    async GetOrders() {
      this.loading = true;
      //同步加载
      const res = await this.$MyHttp.get(
        `orders?pagenum=${this.pagenum}&pagesize=${this.pagesize}`
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
      this.GetOrders();
    },
    handleCurrentChange(val) {
      //当前页码发生改变时
      this.pagenum = val;
      this.GetOrders();
    },
    handelSearch() {
      this.pagenum = 1;
      this.GetOrders();
    },
    //点击编辑按钮
    async handelShowEdit(ID) {
      const res = await this.$MyHttp.get(`orders/${ID}`);
      const {
        data,
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        this.dialogFormVisible = true;
        this.formDate = data/* { 
          order_id: data.order_id,
          order_number: data.order_number,
          order_price: data.order_price,
          order_pay: data.order_pay,
          is_send: data.is_send,
          pay_status: data.pay_status
        } */
        /* if (data.consignee_addr !== '') {
          let addrs = date.consignee_addr.split(',')
          this.formDate.adderss = addrs.pop()
          this.selectOptions = addrs
        } */
      }
    },
    //编辑
    async handelEdit() {
      //支付状态
      if (this.formDate.order_pay !== "0") {
        this.formDate.pay_status === "1"; //已支付
      } else {
        this.formDate.pay_status === "0"; //未支付
      }

      //处理地址
     /*  if (
        this.selectOptions.length !== 0 &&
        this.formDate.adderss !== undefined
      ) {
        this.formDate.consignee_addr =
          this.selectOptions.join(",") + "," + this.formDate.adderss;
      } else {
        this.formDate.consignee_addr = "";
      }

      //处理是否发货
      this.formDate.is_send = this.formDate.is_send === "是" ? 1 : 0;

      const res = await this.$MyHttp.put(
        `orders/${this.formDate.order_id}`,
        this.formDate
      );
      const {
        data,
        meta: { msg, status }
      } = res.data;
      if (status === 201) {
        this.formDate = {};
        this.selectOptions = [];
        this.GetOrders();
        this.dialogFormVisible = false;
      } */
    },
    handleCloseDislog() {
      this.selectOptions = [];
      this.formDate = {};
      this.dialogFormVisible = false
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