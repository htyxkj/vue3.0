<template>
  <div v-if="laycell" class="bip-lay"> 
        <vxe-table
            ref="SYRW_vvt" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
            show-header-all-overflow class="vxe-table-element" :data.sync="this.cds.cdata.data"
            :optimized="true" height="550px" @cell-dblclick="openrefs">
            <vxe-table-column type="index" width="60"></vxe-table-column>
            <vxe-table-column 
              min-width="200"
              header-align="center" align="center" v-for="(cel,index) in laycell.uiCels"
              :key="index" :field="cel.id" :title="cel.labelString" show-header-overflow show-overflow >
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
import { Route, RawLocation } from "vue-router";
import { URIParams } from "@/classes/URIParams"; 
import { User } from '@/classes/User';
import { Menu } from "@/classes/Menu";
import { Cells } from "@/classes/pub/coob/Cells";
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL

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
    @Provide() taskChangebusId:number = 0;
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;

    @Getter('user', { namespace: 'login' }) user?: User;
    async mounted() { 
      this.taskChangebusId= this.$bus.$on('MyTaskChange',this.fetchTaskData)
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
      console.log("fetchTaskData")
      let userCode = "";
      let dataStr = "";
      if(this.user)
          dataStr = "{tousr:'"+this.user.userCode+"'}";
      let qe:QueryEntity = new QueryEntity("SYRW","SYRW",dataStr);
      qe.page.pageSize=this.pageSize
      let vv = await tools.query(qe);
      if(vv.data.id ==0){ 
        this.taskValue = vv.data.data.data.data; 
        let page = vv.data.data.data.page;
        this.pageSize = page.pageSize;
        this.total = page.total;
        this.currPage = page.currPage;
        let cc:any = this.$refs.SYRW_vvt;
        this.cds.setValues(this.taskValue,true);
        if(cc){
          setTimeout(() => {
            cc.clearData();
            cc.reloadData(this.taskValue)
            // cc.refreshData();
            cc.updateData();  
          }, 300);
        }
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
                    /** 获取BUUI定义 */
                    let data = await this.initBUUI(row.buid,row.rlid);
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
                      let slink = data.slink;
                      console.log(data);
                      let menuID = slink.split("&")[0];
                      let key = slink.split("&")[1];
                      key = key.substring(key.indexOf("{")+1,key.indexOf("}"))
                      console.log(key)
                      let me = baseTool.findMenu(menuID);  
                      if (!me) {
                          this.$notify.error( "没有" + menuID + "菜单权限!" );
                          return false;
                      }else{
                        this.upReadState(slkid,slkbuid,row.tousr);
                        let command = me.command.split("&");
                        let pbuid = command[0].split("=");
                        let pmenuid = command[1].split("="); 
                        this.$router.push({
                            path:'/layout',
                            name:'layout',
                            params:{method:"pkfld",pkfld:key,value:slkid},
                            query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                        })
                      }
                    }
                }else{
                    console.log('主键点击')
                }
            }
        }
    }
    //修改任务已读状态
    //单据号,业务号
    upReadState(slkid:string,slkbuid:string,tousr:string){
      //(tskim: number, iid: number, state: number, buno: string, buid: string, tousr: string)
      tools.getTaskMsgData(203,null,null,slkid,slkbuid,tousr,null,null,null);
    }
    beforeDestroy(){
        this.$bus.$off('MyTaskChange',this.taskChangebusId)
    }
    /**
     * BUUI_业务号_审批流节点 定义
     */
    async initBUUI(buid:string,rlid:string){
        let name = "BUUI_"+buid+"_"+rlid;
        let str = name
        str = ICL.AID_KEYCL+str;
        if(!this.aidValues.get(str)){
            let vv  = window.sessionStorage.getItem(str)
            if(!vv){
                let vars = {id:300,aid:name}
                await this.fetchInsAid(vars);
                let vv  = window.sessionStorage.getItem(str)
                if(vv){
                    let vals = {key:str,value:JSON.parse(vv)}
                    this.setAidValue(vals)
                }
            }else{
                let vals = {key:str,value:JSON.parse(vv)}
                this.setAidValue(vals)
            } 
        }
        return this.aidValues.get(str);
    }

    @Watch("$route")
    routerChange(to: Route, from: Route) { 
        if (to.name === "myTask") {
            this.fetchTaskData();
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
