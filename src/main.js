// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import router from './router'
import '@/assets/css/reset.css'
import MyPlugin from '@/plugins/MyPlugin.js'
import moment from 'moment'
//面包屑全局导入
import comBreadcrumb from '@/components/common/ComBreadcrumb.vue'

/* var ElTreeGrid = require('element-tree-grid');
Vue.component(ElTreeGrid.name,ElTreeGrid); */

Vue.use(ElementUI);
Vue.use(MyPlugin)
Vue.config.productionTip = false

Vue.filter('fmtDate',(value)=>{
  return moment(value).format('YYYY-MM-DD')
})

Vue.component('comBreadcrumb',comBreadcrumb)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App},
  template: '<App/>'
})
