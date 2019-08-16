<template>
  <el-row>
    <!-- <el-row style="padding-top:15px">
      我的消息
    </el-row> -->
    <el-row style="padding-top:15px" @keyup.enter="fetchTaskData">
      <el-input v-model="keyword" size="mini" placeholder="关键词" style="width:220px;padding-right:20px" ></el-input>
      <el-button type="primary" size="mini" @click="fetchTaskData">查询</el-button>
    </el-row>
    <el-row style="padding-top:15px">
      <vxe-table
            ref="_vvt" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
            show-header-all-overflow class="vxe-table-element" :data.sync="msgValue"
            :optimized="true" height="450px">
            <vxe-table-column type="index" title="编号" width="60"></vxe-table-column>
            <vxe-table-column header-align="center" align="center" field="title" title="标题" show-header-overflow show-overflow ></vxe-table-column>
            <vxe-table-column header-align="center" align="center" field="dmake" title="时间" show-header-overflow show-overflow ></vxe-table-column>
            <vxe-table-column header-align="center" align="center" field="brd" title="消息状态" show-header-overflow show-overflow >
              <template v-slot="{ row}">
                {{getMsgState(row) }}
              </template>
            </vxe-table-column>
            <vxe-table-column header-align="center" align="center" title="操作" show-header-overflow show-overflow >
            <template v-slot="{ rowIndex}">
              <vxe-button type="text" @click="showMsg(rowIndex)">查看</vxe-button>
              <vxe-button type="text" @click="delMsg(rowIndex)">删除</vxe-button>
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
    </el-row>
    <template v-if="initDialog">
      <el-dialog :title="dialogVl.title" class="bip-assist" :visible.sync="outerVisible" :append-to-body="true" :close-on-press-escape="true" >
        <template> 
          <div class="content-area">
            <div class="c-area">
              <label class="area-label">消息状态</label>
              <span>{{dialogVl.brd}}</span>
            </div>
            <div class="c-area">
              <label class="area-label">时间</label>
              <span>{{dialogVl.dmake}}</span>
            </div>
            <div class="c-area">
              <label class="area-label">消息内容</label>
              <textarea class="area-inner"  rows="5" cols="60" readonly v-model="dialogVl.content"></textarea>
            </div> 
            <el-row type= "flex" justify="center" style="padding:20px">
               <el-button size="mini" type="primary" @click="readMsg">已读</el-button>
               <el-button size="mini" @click="close">取消</el-button>
            </el-row>
          </div>
        </template> 
      </el-dialog>
    </template>
  </el-row>
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

let tools = BIPUtil.ServApi 

@Component({
})
export default class bipTask extends Vue {
    @Provide() pmenuid: string = "";
    @Provide() currPage:number = 1; 
    @Provide() pageSize:number = 20; 
    @Provide() total:number = 0;
    @Provide() msgValue:Array<any>= [];
    @Provide() keyword:string ='';
    @Provide() outerVisible:boolean = false;
    @Provide() initDialog:boolean = false;
    @Provide() dialogVl:any = null;

    @Getter('user', { namespace: 'login' }) user?: User;
    /**
     * 	APIID_TA_MSG  = "taskmsg";//apiid
     *  APIID_TM_ALL  = 200;//获取任务和消息
     *  APIID_TM_TASK  = 201;//只获取未处理任务 
     *  APIID_TM_MSG  = 202;//只获取未处理消息
     *  APIID_TM_TASK_UPD  = 203;//更新状态
     *  APIID_TM_MSG_DTL  = 212;//只获取未处理消息
     *  APIID_TM_MSG_UPD  = 213;//更新状态
     *  APIID_TM_RL  = 249;//重新加载RMQ配置信息
     * 
     */
    async mounted() {  
      this.fetchTaskData();
    }
    async fetchTaskData() {  
      let cc = await tools.getTaskMsgData(212,null,null,null,null,null,this.currPage,this.pageSize,this.keyword);
      if(cc.data.id ==0){
        let page = cc.data.data.page;
        this.msgValue = page.celData; 
        this.total = page.totalItem 
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
    //删除信息
    async delMsg(rowIndex:any){
      // tskim:any,iid:any,state:any,buno:any,buid:any,tousr:any,page:any,size:any
      let row = this.msgValue[rowIndex]
      let cc = await tools.getTaskMsgData(213,row.iid,3,null,null,null,null,null,null);
      this.fetchTaskData();
    }
    async readMsg(){
      let row = this.dialogVl
      let cc = await tools.getTaskMsgData(213,row.iid,2,null,null,null,null,null,null);
      this.fetchTaskData();
    }
    //显示详细信息
    async showMsg(rowIndex:any){
      let row = this.msgValue[rowIndex] 
      this.dialogVl = row; 
      this.dialogVl.brd = this.getMsgState(row);
      this.initDialog = true;
      this.outerVisible = true;
    }
    getMsgState(row :any){
      if(row.brd == 0)
        return "未读"
      return "已读"
    }
    close(){
      this.outerVisible=false;
    }
}
</script>

<style lang="scss" scoped>

.content-area {
  color: #48576a;
  font-size: 14px;
  padding: 20px
}

.c-area {
  display: inline-block;
  width: 100%;
  vertical-align: bottom;
  margin-bottom: .2rem;
}

.area-inner {
  display: block;
  resize: none;
  padding: 5px 7px;
  line-height: 1.5;
  color: #1f2d3d;
  background-color: #fff;
  background-image:none;
  border:1px solid #bfcbd9;
  border-radius: 4px;
  transition:border-color .2s cubic-bezier(.645,.045,.355,1);
  box-sizing: border-box; 
  float: left;
}
.area-label{
  width:5rem;
  float: left;
}
</style>
 