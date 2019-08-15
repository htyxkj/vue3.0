<template>
  <div v-if="laycell" class="bip-lay"> 
        <vxe-table
            ref="_vvt" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
            show-header-all-overflow class="vxe-table-element" :data.sync="taskValue"
            :optimized="true" height="550px" @cell-dblclick="openrefs">
            <vxe-table-column type="index" width="60"></vxe-table-column>
            <vxe-table-column 
              header-align="center" align="center" v-for="(cel,index) in laycell.uiCels"
              :key="index" :prop="cel.id" :label="cel.labelString" show-header-overflow show-overflow >
              <template v-slot="{row,rowIndex}">
                  <bip-grid-info
                      :cds="cds"
                      :cell="cel"
                      :index="rowIndex"
                      :row="rowIndex"
                  ></bip-grid-info>
              </template>
            </vxe-table-column>
        </vxe-table>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 30,40,50]"
            layout="slot,total,prev, pager, next,sizes"
            :total="total">
        </el-pagination>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import { BIPUtil } from "@/utils/Request"; 
import { URIParams } from "@/classes/URIParams"; 
import { User } from '@/classes/User';
import { Menu } from "@/classes/Menu";
import { Cells } from "@/classes/pub/coob/Cells";

import CCliEnv from "@/classes/cenv/CCliEnv";
import CDataSet from "@/classes/pub/CDataSet";
import QueryEntity from "@/classes/search/QueryEntity";
import BaseApplet from '../applet/BaseApplet.vue'
import CUnivSelect from '../report/CUnivSelect.vue' 
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
let tools = BIPUtil.ServApi 
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
@Component({
    components:{BipGridInfo}
})
export default class bipTask extends Vue {
    @Provide() pbuid: string = "";
    @Provide() pmenuid: string = "";
    @Provide() uriParams: URIParams = new URIParams();
    @Provide() fullscreenLoading: boolean = false;
    @Provide() cds: CDataSet = new CDataSet(null);
    @Provide() taskLayCel:any;
    @Provide() laycell:any = null;
    @Provide() env: CCliEnv = new CCliEnv();
    @Provide() currPage:number = 1; 
    @Provide() pageSize:number = 20; 
    @Provide() total:number = 0;
    @Provide() uiCels:Array<any>= [];
    @Provide() taskValue:Array<any>= [];

    @Getter('user', { namespace: 'login' }) user?: User;
    async mounted() { 
      let res = await tools.getCCellsParams('SYRW'); 
      let rtn: any = res.data; 
      if (rtn.id == 0) {
        let kn: Array<Cells> = rtn.data.layCels;
        let cells = kn; 
        this.cds = new CDataSet(cells[0]); 
        let cels = cells[0].cels; 
        for(var i=0;i<cels.length;i++){
          let cel = cels [i];
          if(cel.attr>0){ 
            if((cel.attr&0x400)===0)
              this.uiCels.push(cel)
          }else{
            this.uiCels.push(cel)
          }
        }
        this.laycell={};
        this.laycell.cells = cells[0];
        this.laycell.uiCels = this.uiCels;
      } 
      this.fetchTaskData();
    }
    async fetchTaskData() {  
      let userCode = "";
      let dataStr = "";
      if(this.user)
          dataStr = "{tousr:'"+this.user.userCode+"'}";
      let qe:QueryEntity = new QueryEntity("SYRW","SYRW",dataStr);
      qe.page.pageSize=this.pageSize
      let vv = await tools.query(qe);
      console.log(vv)
      if(vv.data.id ==0){ 
        this.taskValue = vv.data.data.data.data; 
        let page = vv.data.data.data.page;
        this.pageSize = page.pageSize;
        this.total = page.total;
        this.currPage = page.currPage;
        this.cds.setValues(this.taskValue); 
      }
    }

    handleSizeChange(value: number) {
      this.pageSize = value;
      this.fetchTaskData();
    }

    handleCurrentChange(value: number) {
      this.currPage = value;
      this.fetchTaskData();
    } 
    async openrefs(data:any,event:any){
        let row = data.row.data
        let rowIndex = data.rowIndex
        let columnIndex = data.columnIndex
        if(columnIndex > 0){
            let cell = this.laycell.uiCels[columnIndex-1]
            if( (cell.attr & 1) >0 || (cell.attr & (0x80000)) >0 ) { // 0主键   0x80000关联
                let slkid = row[cell.id];
                if ((cell.attr & 0x80000) > 0) {//关联
                    let allCels = this.laycell.cells.cels;
                    let slkbuidCell = null;
                    for(var i=0;i<allCels.length;i++){
                        let oneCel = allCels[i];
                        if(oneCel.id == cell.id){
                            slkbuidCell = allCels[i+1];
                            break;
                        }
                    } 
                    let slkbuid = ''
                    if(slkbuidCell)
                        slkbuid = row[slkbuidCell.id];
                    let data = null;//获取常量定义的 BL_菜单号_字段ID 进行菜单打开
                    if(data == null){
                        if (slkid && slkbuid) { 
                            //获取业务定义
                            let param = await tools.getBULinks(slkbuid);
                            if(param.data.id ==0){
                                let opera = param.data.data.opt;
                                if (opera&&!opera.pmenuid) {
                                    this.$notify.error("业务" + slkbuid + "没有绑定菜单!"); 
                                    return false;
                                }
                                let me = baseTool.findMenu(opera.pmenuid);  
                                if (!me) {
                                    this.$notify.error( "没有" + opera.pmenuid + "菜单权限!" );
                                    return false;
                                }else{
                                  this.upReadState(slkid,slkbuid,row.tousr);
                                  
                                  let command = me.command.split("&");
                                  let pbuid = command[0].split("=");
                                  let pmenuid = command[1].split("="); 
                                  this.$router.push({
                                      path:'/layout',
                                      name:'layout',
                                      params:{method:"pkfld",pkfld:opera.pkfld,value:slkid},
                                      query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                                  })
                                }
                            }  
                        }
                    }else{

                    }
                }else{
                    console.log('主键点击')
                }
            }
        }
    }
    findMenuById(menuId:string,menu:Menu):any{
      if(menu.menuId==menuId){
          return menu
      }else{
          if(menu.haveChild){
              for(let i = 0;i<menu.childMenu.length;i++){
                  let m1 = this.findMenuById(menuId,menu.childMenu[i])
                  if(m1!=null){
                      return m1;
                  }
              }
          }
          return null;
      }
    }
    //修改任务已读状态
    //单据号,业务号
    upReadState(slkid:string,slkbuid:string,tousr:string){
      //(tskim: number, iid: number, state: number, buno: string, buid: string, tousr: string)
      tools.getTaskMsgData(203,null,null,slkid,slkbuid,tousr,null,null,null);
    }
}
</script>

<style lang="scss" scoped>

</style>
