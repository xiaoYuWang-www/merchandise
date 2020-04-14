<template>
      <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{this.levelNameOne}}</el-breadcrumb-item>
        <el-breadcrumb-item>{{this.levelNameTwo}}</el-breadcrumb-item>
      </el-breadcrumb>
</template>

<script>
export default {
    name : 'comBreadcrumb' ,
    props :['levelNameOne','levelNameTwo']
}
</script>   

<style>
    .breadcrumb{
        margin-bottom: 20px;
    }
</style>