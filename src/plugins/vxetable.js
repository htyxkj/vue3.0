import Vue from "vue";
import VXETable from "vxe-table";
import 'vxe-table/lib/index.css'

import VXETablePluginElement from 'vxe-table-plugin-element'
import VXETablePluginExportXLSX from 'vxe-table-plugin-export-xlsx'

Vue.use(VXETable);
VXETable.use(VXETablePluginElement)
VXETable.use(VXETablePluginExportXLSX)

VXETable.interceptor.add('event.clear_actived', (params, event) => {
    // 比如点击了某日期组件的面板，此时被激活单元格不应该被自动关闭，通过返回 false 可以阻止默认的行为。
    // console.log(params,event)
    console.log('999',event.target.className)
    if (event.target.className.indexOf('bip')>-1||event.target.className.indexOf('cell')>-1
    ||event.target.className.indexOf('el-button')>-1 ||event.target.className=='' 
    || event.target.className.indexOf('scrolling')>-1 || event.target.className.indexOf('el-')>-1
    ||event.target.className=='number'|| event.target.className.indexOf("empty")>-1 
    ||event.target.className.indexOf("body")>-1 || event.target.className.indexOf("setting-btn")>-1
    ||event.target.className.indexOf("vxe-icon--menu")>-1 ||event.target.className.indexOf("vxe-checkbox") >-1
    ||event.target.className.indexOf("vxe-custom") >-1 ||event.target.className.indexOf("btn-next") >-1
    ) {
      return false
    }
  })