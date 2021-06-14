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
    let className = params.$event.target.className;
    if (className.indexOf('bip')>-1||className.indexOf('cell')>-1
    ||className.indexOf('el-button')>-1 ||className=='' 
    || className.indexOf('scrolling')>-1 || className.indexOf('el-')>-1
    ||className=='number'|| className.indexOf("empty")>-1 
    ||className.indexOf("body")>-1 || className.indexOf("setting-btn")>-1
    ||className.indexOf("vxe-icon--menu")>-1 ||className.indexOf("vxe-checkbox") >-1
    ||className.indexOf("vxe-custom") >-1 ||className.indexOf("btn-next") >-1
    ) {
      return false
    }
  })