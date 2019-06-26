<template>
  <div>
    <h1>我是首页</h1>

        <vxe-table border
            highlight-hover-row
          :data.sync="tableData" size="small" :optimized="true" :maxHeight="500">
          <vxe-table-column type="index" width="60"></vxe-table-column>
          <vxe-table-column prop="name" label="Name"></vxe-table-column>
          <vxe-table-column prop="sex" label="Sex"></vxe-table-column>
          <vxe-table-column prop="age" label="Age"></vxe-table-column>
        </vxe-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from "vue-property-decorator";
import { Menu } from "@/classes/Menu";
import BipMenu from "@/components/menu/BipMenu.vue";
import { Route, RawLocation } from 'vue-router';
@Component({
  components: {
    BipMenu
  }
})
export default class Home extends Vue {
  @Provide() menus: Array<Menu> = [];
  @Provide() tableData:any = []
  mounted() {
    this.menus = JSON.parse(window.sessionStorage.getItem("menulist") + "");
    if (this.menus == null) {
      this.menus = [];
      
    }
    this.initTableData()
  }

  initTableData(){
      for(let i=0;i<=999;i++){
          let peo = {name:'张三'+i,sex:i%2==0?'F':'M',age:"fdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfjflkdsjflkajf;lkdsajfdsalk;fjd;lksafads"+Math.random()*100/10};
          this.tableData.push(peo);
      }
  }
}
</script>

<style>
.menu-title{
    height:60px;
    padding-left: 10px;
}
</style>




