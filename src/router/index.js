import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/login/login.vue'
import Home from '@/components/home/home.vue' 
import User from '@/components/user/user.vue'
import Authority from '@/components/authority/authority.vue'
import Roles from '@/components/authority/roles.vue'
import { Message } from 'element-ui'
import Goods from '@/components/goods/goodslist.vue'
import GoodsAdd from '@/components/goods/goodsadd.vue'
import GoodsEdit from '@/components/goods/goodsedit.vue'
import Cateparams from '@/components/goods/cateparams.vue'
import GoodCate from '@/components/goods/goodcate.vue'
import Orders from '@/components/goods/orders.vue'
Vue.use(Router)

const router = new Router({
  routes: [
    {path : '/' , component : Login},
    {name : 'login', path : '/login',  component : Login},
    {name : 'home', path : '/home',  component : Home, 
    children :[
      {name : 'users', path : '/users',  component : User} ,
      {name : 'rights', path : '/rights',  component : Authority},
      {name : 'roles', path : '/roles',  component : Roles},
      {name : 'goods', path : '/goods',  component : Goods},
      {name : 'goodsadd', path : '/goodsadd',  component : GoodsAdd},
      {name : 'goodsedit', path : '/goodsedit/:id',  component : GoodsEdit},
      {name : 'params', path : '/params',  component : Cateparams},
      {name : 'categories', path : '/categories',  component : GoodCate},
      {name : 'orders', path : '/orders',  component : Orders},
    ]}, 
     
  ]
})

// 解决两次访问相同路由地址报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

//路由守卫
router.beforeEach((to, from, next) => {
  let token = localStorage.getItem("token");
  if(to.name === 'login' || token){
    next()
  }else{
      router.push({'name':'login'})
      Message.warning('请先登录') 
      return
  }
})

export default router
