<template>
  <el-col class="userCard">
    <el-card shadow="always" class="userCard">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-table :data="tableData" style="width: 100%" class="table" height="700px">
        <el-table-column prop="id" label="#" width="100"></el-table-column>
        <el-table-column prop="authName" label="权限名称" width="180"></el-table-column>
        <el-table-column prop="path" label="路径" width="180"></el-table-column>
        <el-table-column prop="level" label="层级" width="180"> 
            <template slot-scope="scope">
                 <span v-if="scope.row.level === '0'">一级</span>
                 <span v-if="scope.row.level === '1'">二级</span>
                 <span v-if="scope.row.level === '2'">三级</span>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-col>
</template>

<script>
export default {
    data() {
        return {
            tableData :[]
        }
    },
    mounted(){
         this.getRights()
    },
    methods : {
        getRights(){
            this.$MyHttp.get('rights/list')
            .then(res => {
                const {data , meta : {status , msg}} = res.data
                if(status ===200){
                    this.tableData = data
                     this.$message.success(msg);
                }else{
                     this.$message.error(msg);
                }
            })
        }
    }
};
</script>   

<style>
    .table{
        margin: 20px 0px;
    }
    .userCard{
        height: 100%;
    }
</style>