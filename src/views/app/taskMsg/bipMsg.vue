<template>
  <el-row>
    <el-row style="padding:10px 10px 0px 10px" @keyup.enter="fetchTaskData" :gutter="20">
      <el-col :span="10">
        <el-input placeholder="请输入内容" v-model="keyword" class="input-with-select" size="medium">
        <el-button slot="append" icon="el-icon-search" @click="fetchTaskData"></el-button>
        </el-input>
      </el-col>
      <el-col :span="10">
         <el-button type="success" size="medium" icon="el-icon-check" style="padding-right:20px" @click="readById(tableChecked)">已读</el-button>
      </el-col>
      <!-- <el-button type="primary" size="mini"  @click="removeById(tableChecked)">全部删除</el-button> -->
    </el-row>
    <el-row style="padding-top:10px">
      <vxe-table
            ref="_vvt" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
            show-header-all-overflow class="vxe-table-element" :data.sync="msgValue"
            :optimized="true" height="450px" @checkbox-change="selectChangeEvent"  @checkbox-all="selectChangeEvent">
            <vxe-table-column type="checkbox" width="60"></vxe-table-column>
            <vxe-table-column field="iid" title="编号" width="80" header-align="center" align="center"></vxe-table-column>
            <vxe-table-column header-align="center" align="center" field="title" title="标题" show-header-overflow show-overflow width="200"></vxe-table-column>
            <vxe-table-column header-align="center"  field="content" title="消息内容" show-header-overflow show-overflow  ></vxe-table-column>
            <vxe-table-column header-align="center" align="center" field="dmake" title="接受时间" show-header-overflow show-overflow width="180"></vxe-table-column>
            <vxe-table-column header-align="center" align="center" field="brd" title="消息状态" show-header-overflow show-overflow width="120">
              <template v-slot="{ row}">
                {{getMsgState(row) }}
              </template>
            </vxe-table-column>
            <vxe-table-column header-align="center" align="center" title="操作" show-header-overflow show-overflow width="180">
            <template v-slot="{ rowIndex}">
              <el-button type="primary" @click="showMsg(rowIndex)" size="mini" icon="el-icon-edit">查看</el-button>
              <el-button type="success" @click="readMsg_1(rowIndex)" size="mini" icon="el-icon-check">已读</el-button>
              <!-- <vxe-button type="text" @click="showMsg(rowIndex)"></vxe-button>
              <vxe-button type="text" @click="delMsg(rowIndex)">删除</vxe-button> -->
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
         <el-dialog class="bipinsaid"  :visible.sync="outerVisible" :append-to-body="true" :close-on-press-escape="true" width="50%" >
            <span slot="title">
                <div class="el-dialog__title" style="padding-bottom:5px">我的消息</div>
            </span>
        <template> 
          <el-form ref="form"  label-width="90px" style="padding:10px">
            <el-form-item label="标题">
              <el-input v-model="dialogVl.title"></el-input>
            </el-form-item>
            <el-form-item label="消息内容">
              <el-input type="textarea" v-model="dialogVl.content"></el-input>
            </el-form-item>
             <el-form-item label="发送人">
              <el-input v-model="dialogVl.smake.userName"></el-input>
            </el-form-item>
            <el-form-item label="发送时间">
              <el-input v-model="dialogVl.dmake"></el-input>
            </el-form-item>
            <el-form-item label="消息状态">
              <el-input v-model="dialogVl.brd"></el-input>
            </el-form-item>
          </el-form>
            <div>
            <el-row type= "flex" justify="center" style="padding:20px">
               <el-button size="mini" type="success" icon="el-icon-check" @click="readMsg">已读</el-button>
               <!-- <el-button size="mini" @click="close">取消</el-button> -->
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
    @Provide() msgChangebusId:number = 0;
    @Getter('user', { namespace: 'login' }) user?: User;
    tableChecked:any = [];
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
      this.msgChangebusId= this.$bus.$on('MyMsgChange',this.fetchTaskData)
      this.fetchTaskData();
    }
    async fetchTaskData() {  
      let cc = await tools.getTaskMsgData(212,null,null,null,null,null,this.currPage,this.pageSize,this.keyword);
      console.log(cc)
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
    selectChangeEvent (data:any) {
        this.tableChecked = data.records;
    }
    /**
     * 全部删除
     * wangruxin
     */
    async removeById() {  
        let selectRecords = this.tableChecked.length;
        if(selectRecords=="0"){
            this.$confirm('请选择要删除的数据！', '提示', {
            confirmButtonText: '确定',
            type: 'success'
            });
        }else{
            this.$confirm('确定删除该记录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(async () => {
               for(var i=0;i<this.tableChecked.length;i++){
                  let cc = await tools.getTaskMsgData(213,this.tableChecked[i].iid,3,null,null,null,null,null,null);
               }
               this.$message({
                type: 'success',
                message: '删除成功!'
              });
               this.fetchTaskData();
        }).catch(() => {
              
        });
        }
    }
    /**
     * 全部已读
     * wangruxin
     */
    async readById(){
       let selectRecords = this.tableChecked.length; 
       if(selectRecords=="0"){
            this.$confirm('请选择要已读的数据！', '提示', {
            confirmButtonText: '确定',
            type: 'success'
            });
        }else{
             for(var i=0;i<this.tableChecked.length;i++){
                let cc = await tools.getTaskMsgData(213,this.tableChecked[i].iid,2,null,null,null,null,null,null);
            }
            this.$message({
            type: 'success',
            message: '已读!'
            });
        this.fetchTaskData();  
        }
         
    }
    async readMsg(){
      let row = this.dialogVl
      let cc = await tools.getTaskMsgData(213,row.iid,2,null,null,null,null,null,null);
      this.fetchTaskData();
      this.outerVisible=false;
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
    beforeDestroy(){
      this.$bus.$off('MyMsgChange',this.msgChangebusId)
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
 