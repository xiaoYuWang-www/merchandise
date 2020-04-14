//插件模块

import axios from 'axios'

const MyPlugin = {}

MyPlugin.install =  (Vue) => {
    var instance = axios.create({
       baseURL : 'http://localhost:8888/api/private/v1/'
    });
    // 添加请求拦截器
    instance.interceptors.request.use(function (config) {
      // 在发送请求之前做些什么
      if(config.url !== 'login'){
         config.headers['Authorization']=localStorage.getItem('token')  
      }
      return config;
    }, function (error) {
      // 对请求错误做些什么
      return Promise.reject(error);
    });
   
    //  添加实例方法
    Vue.prototype.$MyHttp = instance
      
  }

  export default  MyPlugin