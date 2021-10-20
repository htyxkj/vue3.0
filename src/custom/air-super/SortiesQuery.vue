<template>
  <div class="sortquery">
      <div class="nav">
          <el-button  icon="el-icon-search" size="mini" @click="selectCoList">查询</el-button>
          <el-button icon="iconfont icon-bip-save" size="mini" @click="saveAll">保存</el-button>
          <el-button icon="el-icon-full-screen" size="mini" @click="fullImage">全图</el-button>
          <el-button icon="iconfont icon-bip-xiazai1" size="mini" @click="exportSorties">导出</el-button>
          <!-- <el-button icon="el-icon-picture-outline" size="mini" @click="makeWorlkImg">生成作业图片</el-button> -->
      </div>
      <div class="query">
          <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in taskTjCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor
                            v-if="(cel.attr&0x400) <= 0 "
                            :cell="cel"
                            :bgrid="false"
                            :cds="taskTjCell"
                            :row="0"
                        />
                    </div>
                </el-form>
            </el-row>
      </div>

      <div class="sortdata">
        <vxe-toolbar ref="xToolbar" custom class="sortiesQuery-vxe-toolbar"></vxe-toolbar>
        <vxe-table
                :height="style1"
                border
                ref="jcTable"
                resizable
                size="small"
                highlight-hover-row
                show-all-overflow="tooltip"
                show-header-overflow
                highlight-current-row
                class="vxe-table-element checkbox-table"
                :edit-config="{trigger: 'click', mode: 'cell',showStatus: true,showIcon:false}"
                :data.sync="jcCell.cdata.data" 
                remote-sort
                :sort-config="{trigger: 'cell'}"
                show-footer
                row-id="id"
                :optimized="true"
                @edit-actived="rowActive"
                @edit-closed="editClose"
                :selectRow="jcCell.currRecord"
                > 
                <vxe-table-column title="操作" width="60">
                    <template v-slot="{ row }">
                        <i class="el-icon-picture-outline" @click="goToSortiesTrack(row.data.tkid,row.data.bgtime1,row.data.edtime1)"></i>
                    </template>
                </vxe-table-column>
                <template v-for="(cel,index) in jcCell.ccells.cels">
                    <vxe-table-column
                        header-align="center"
                        align="center" 
                        :key="index"
                        :field="cel.id" 
                        :title="cel.labelString"
                        show-header-overflow
                        :edit-render="{name: 'default'}"
                        show-overflow
                        :disabled="(cel.attr&0x40)>0"
                        v-if="(cel.attr & 0x400) == 0"
                        min-width="100px"
                    >
                        <template v-slot:edit="{row,rowIndex}">
                            <bip-comm-editor  :cell="cel" :cds="jcCell" :row="rowIndex" :bgrid="true"/> 
                        </template>
                        <template v-slot="{row,rowIndex}">
                            <bip-grid-info
                                :cds="jcCell"
                                :cell="cel"
                                :row="rowIndex"
                                :bgrid="true"
                            ></bip-grid-info>
                        </template>
                    </vxe-table-column>
                </template>
            </vxe-table>
            <!-- <vxe-table
                border
                align="center"
                size="mini"
                :height="style1"
                ref="xTable1"
                :data="tableData">
                <vxe-table-column field="id" title="主键" ></vxe-table-column> 
                <vxe-table-column field="tkid" title="任务标识" ></vxe-table-column>
                <vxe-table-column title="操作" width="60">
                    <template v-slot="{ row }">
                        <i class="el-icon-picture-outline" @click="goToSortiesTrack(row.tkid,row.bgtime1,row.edtime1)"></i>
                    </template>
                </vxe-table-column>
                <vxe-table-column field="ssid" title="序号"  width="60"></vxe-table-column>
                <vxe-table-column field="asid" title="飞机编号"  width="100"></vxe-table-column>
                <vxe-table-column field="usrcode" title="终端账户" width="100" ></vxe-table-column>
                <vxe-table-column field="asidscm" title="通航公司" width="150" ></vxe-table-column>
                <vxe-table-column field="bgtime1" title="开始时间" width="100"></vxe-table-column>
                <vxe-table-column field="edtime1" title="结束时间"  width="100"></vxe-table-column>
                <vxe-table-column field="avgaltitude" title="平均海拔(m)" width="90" ></vxe-table-column>
                 <vxe-table-column field="sumtime" title="喷洒时长" width="100" ></vxe-table-column>
                <vxe-table-column field="avgspeed" title="平均航速(km/h)" width="120"></vxe-table-column>
                <vxe-table-column field="summileage" title="喷洒里程(km)" width="100"></vxe-table-column>
                <vxe-table-column field="sumarea" title="喷洒面积(亩)"  width="100"></vxe-table-column>
                <vxe-table-column field="avgflow" title="平均流量(m3/h)" width="120" ></vxe-table-column>
                <vxe-table-column field="sumflow" title="总流量(m3)" width="100" ></vxe-table-column>
            </vxe-table> -->
        </div>
        <!-- <div id = "JCTMap">
            <t-map ref="TMap" class="myTMap"></t-map> 
        </div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
import tMap from "@/components/map/MyTianMap.vue";
import { T } from "@/components/map/js/TMap";
import { TMapUtils } from "./class/TMapUtils";
let TMapUt = TMapUtils.TMapUt;
import domtoimage from 'dom-to-image';
@Component({
  components: {
    BipGridInfo,tMap,
  }
})
export default class followTimesLine extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Provide() style1: string = ""+ (this.height ? this.height - 85 : "400");
    @Provide() page: any = { pageSize: 100, currPage: 1, total: 0 };
    @Provide() tableData: Array<any> = [];
    @Provide() taskTjCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
    @Provide() jcCell:CDataSet = new CDataSet("");//架次对象

    // @Provide() tMap: any = null;
    // @Provide() tZoom: number = 12;

    // @Provide() sprayLine0:any=[];//喷洒轨迹（农药范围）
    // @Provide() sprayLine1:any=[];//喷洒轨迹（一像素的线）
    // @Provide() sprayLine2:any=[];//飞行轨迹（没有喷洒农药的轨迹线）
    // @Provide() sprayBreak:boolean = true;//喷洒是否中断
    // @Provide() flightBeltColor:string = "#ADFF2F"//行带颜色
    // @Provide() flightBeltOpacity:number = 0.3;//航道透明度
    // @Provide() flightBeltWidth:number = 0;//航带宽度 米
    // @Provide() trackColor:string = "#FFFF00";//航迹颜色
    // @Provide() noFlowColor:string = "#F40";//未喷洒农药时的轨迹颜色
    // @Provide() showMapD:boolean = false;//是否显示地图弹窗

    async created() {
        if (this.height) {
            this.style1 = ""+ (this.height - 250);
        }

        // 初始化条件查询区域
        this.taskTjCell = await this.getCell("FW0320TJ");
        this.taskTjCell.createRecord();
        this.jcCell = await this.getCell("FW0320");
        
    }
  mounted() {
//     if (this.$refs.TMap) {
//         let refT: any = this.$refs.TMap;
//         this.tMap = refT.getMap();
//         // this.tMap.addEventListener("zoomend", this.zoomend);//地图缩放结束
//     }
  }
 
  // ------------------------数据请求-----------------

  //  1.获取任务对应架次信息
  async selectCoList() {
    this.jcCell.cdata.data = [];
    let tkid = this.taskTjCell.currRecord.data.sid; 
    let sumarea = this.taskTjCell.currRecord.data.sumarea
    let isvalid = this.taskTjCell.currRecord.data.isvalid
    // if(tkid == "" || tkid == null){
    //     this.$notify.error("请选择任务名称！");
    //     return;
    // }
    if(sumarea == null || sumarea =='' || sumarea =='null'){
        sumarea = "";
    }
    if(isvalid == null || isvalid =='' || isvalid =='null'){
        isvalid = "";
    }
    let qe: QueryEntity = new QueryEntity("FW0320", "FW0320");
    qe.page = this.page;
    qe.cont = "{'tkid':'"+tkid+"','sumarea':'"+sumarea+"','isvalid':'"+isvalid+"'}";
    qe.oprid = 13;
    let vv = await tools.query(qe);
    if (vv.data.id == 0) {
    //     console.log(vv)
    //   let _tableData = vv.data.data.data.data;  
      this.jcCell.cdata.data = vv.data.data.data.data;  
    //   this.tableData = [];
    //   for (let index = 0; index < _tableData.length; index++) {
    //     this.tableData.push(_tableData[index].data);
    //   }
        let cc:any = this.$refs["jcTable"];
        if(cc){
            setTimeout(() => {
                cc.clearCurrentRow() 
                cc.refreshData();
            }, 200);
        }
    }
  }
    rowActive(rowInfo: any, event: any) {
        this.jcCell.currRecord = this.jcCell.getRecordAtIndex(rowInfo.rowIndex);
        this.jcCell.index = rowInfo.rowIndex;
    }

    editClose(rowInfo: any, event: any) {
        this.jcCell.currRecord = this.jcCell.getRecordAtIndex(rowInfo.rowIndex);
    }
    /**
     * 航迹全图
     */
    fullImage(){
        let tkid = this.taskTjCell.currRecord.data.sid; 
        if(tkid == "" || tkid == null){
            this.$notify.error("请选择任务名称！");
            return;
        }
        let bgtime = this.taskTjCell.currRecord.data.bgtime;
        let edtime = this.taskTjCell.currRecord.data.edtime;
        this.goToSortiesTrack(tkid,bgtime,edtime);
    }
    goToSortiesTrack(tkid:any,bgtime:any,edtime:any){
        this.$router.push({
            path:'/TrackShow',
            name:'TrackShow',
            params:{tkid:tkid,bgtime:bgtime,edtime:edtime},
            query: {pmenuid:"M0313"},
        })
    }
    async saveAll(){
        this.taskTjCell.currRecord.c_state = 2; 
        let restj = await this.taskTjCell.saveData();
        var num = 0;
        if(restj.data.id != 0){ 
            this.$notify.error("全图保存失败！")
            num++;
        }
        let datas = this.jcCell.cdata.data;
        for(var i=0;i<datas.length;i++){
            this.jcCell.currRecord = datas[i];
            this.jcCell.currRecord.c_state =2;
            let cc = await this.jcCell.saveData();
            if(cc.data.id != 0){
                this.$notify.error("第"+datas[i].data.ssid+"架次保存失败！")
                num++;
            }
        }
        if(num==0){
            this.$notify.success("保存成功！");
        }
    }
    // 获取对象信息
    async getCell(cellid: string) {
        let res = await tools.getCCellsParams(cellid);
        let rtn: any = res.data;
        if (rtn.id == 0) {
        let kn: Array<Cells> = rtn.data.layCels;
        let cells = kn;
        return new CDataSet(cells[0]);
        } else {
        return new CDataSet("");
        }
    }
/******************** 生成作业图片 *********************/
    // /**
    //  * 生成飞防作业图片
    //  */
    // async makeWorlkImg(){
    //     this.$notify.error("功能开发中，敬请期待！");
    //     // this.showMapD = true;
    //     let taskAll = this.taskTjCell.currRecord.data
    //     if(taskAll.sid && taskAll.bgtime && taskAll.edtime){
    //         await this.getOneTask(taskAll.sid,taskAll.bgtime,taskAll.edtime);
    //     }
    //     let jcCdata = this.jcCell.cdata.data;
    //     for(var i=0;i<jcCdata.length;i++){
    //         let jcdata = jcCdata[i].data;
    //         if(jcdata.tkid && jcdata.bgtime1 && jcdata.edtime1){
    //             await this.getOneTask(jcdata.tkid,jcdata.bgtime1,jcdata.edtime1);
    //         }
    //     }
    // }
    // /**
    //  * 重新飞防轨迹信息
    //  */
    // async getOneTask(tkid:any,bgtime:any,edtime:any){
    //     let qe: QueryEntity = new QueryEntity("", "");
    //         qe.page.currPage = 1;
    //         qe.page.pageSize = 50000;
    //         let cont =" tkid ='" +tkid +"' and " +"speedtime >=" +"'" +bgtime +"'" +" and " +"speedtime<=" + "'" +edtime +"'";
    //         qe.cont = cont;
    //         let t1 = new Date().getTime();
    //         let cc = await tools.getBipInsAidInfo("CORRD", 210, qe);
    //         let t2 = new Date().getTime();
    //         console.log("用时（秒）" + (t2 - t1) / 1000);
    //         if (cc.data.id == 0) {
    //             let values = cc.data.data.data.values;
    //             await this.drawTrack(values)
    //         }
    // }
    // /**
    //  * 绘制 航带 航迹 
    //  */
    // drawTrack(values:any){
    //     this.tMap.clearOverLays();
    //     let po = [];
    //     for(var i=0;i<values.length;i++){
    //         let data = values[i];
    //         if(data && data.longitude!=0 && data.latitude !=0){
    //             let flow = data.flow;
    //             let lgt = new T.LngLat(data.longitude, data.latitude)
    //             po.push(lgt);
    //         }
    //     }
    //     let t1 = this.tMap.getViewport(po);
    //     this.tMap.panTo(t1.center, t1.zoom);
    //     for(var i=0;i<values.length;i++){
    //         let data = values[i];
    //         if(data && data.longitude!=0 && data.latitude !=0){
    //             let flow = data.flow;
    //             let lgt = new T.LngLat(data.longitude, data.latitude)
    //             if(flow>0){//有流量去划线
    //                 if(this.sprayBreak){//中断过需要从起一条线
    //                     let points = [];
    //                     let zoom = this.tMap.getZoom();
    //                     let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
    //                     let opts0 = {color:this.flightBeltColor,weight:cc*this.flightBeltWidth,opacity:this.flightBeltOpacity};
    //                     points.push(lgt);
    //                     var newLine0 = new T.Polyline(points,opts0);
    //                     this.tMap.addOverLay(newLine0);
    //                     this.sprayLine0.push(newLine0)
    //                     let opts1 = {color:this.trackColor,weight:1,opacity:1};
    //                     var newLine1 = new T.Polyline(points,opts1);
    //                     this.tMap.addOverLay(newLine1);     
    //                     this.sprayLine1.push(newLine1)
    //                 }else{//没有中断需要在最后一条线追加点 或重画最后一条线
    //                     let line0 = this.sprayLine0[this.sprayLine0.length-1];
    //                     let points0 = line0.getLngLats();
    //                     points0.push(lgt);
    //                     line0.setLngLats(points0)
    //                     let line1 = this.sprayLine1[this.sprayLine1.length-1];
    //                     let points1 = line1.getLngLats();
    //                     points1.push(lgt);
    //                     line1.setLngLats(points1)
    //                 }
    //                 this.sprayBreak = false;
    //             }else{
    //                 if(this.sprayBreak && this.sprayLine2.length>0){
    //                     let line2 = this.sprayLine2[this.sprayLine2.length-1];
    //                     let points2 = line2.getLngLats();
    //                     points2.push(lgt);
    //                     line2.setLngLats(points2)
    //                 }else{
    //                     let opts2 = {color:this.noFlowColor,weight:1,opacity:1};
    //                     let points = [];
    //                     points.push(lgt);
    //                     var newLine2 = new T.Polyline(points,opts2);
    //                     this.tMap.addOverLay(newLine2);     
    //                     this.sprayLine2.push(newLine2)
    //                 }
    //                 this.sprayBreak = true;
    //             }
    //         }
    //     }
    //     this.Screenshot();
    // }
    // /**
    //  * 地图缩放结束
    //  */
    // zoomend(){
    //     let zoom = this.tMap.getZoom();
    //     let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
    //     let opts0 = {color:this.flightBeltColor,weight:cc*this.flightBeltWidth,opacity:this.flightBeltOpacity};
    //     //重新画 农药喷洒范围
    //     for(var i=0;i<this.sprayLine0.length;i++){
    //         let line = this.sprayLine0[i];
    //         let points = line.getLngLats();
    //         var newLine = new T.Polyline(points,opts0);
    //         this.tMap.addOverLay(newLine);
    //         this.sprayLine0[i] = newLine;
    //         this.tMap.removeOverLay(line);
    //     }
    //     this.Screenshot();
    // }
    // Screenshot(){
    //     console.log("开始截图")
    //     domtoimage.toBlob(document.getElementById('JCTMap')).then(function (data:any) {
    //         let blob = new Blob([data], {
    //             type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
    //         });
    //         let date = TMapUt.dateFormat(new Date(),"yyyy-MM-dd_HH:mm:ss")
    //         var url = window.URL.createObjectURL(blob); 
    //         var a = document.createElement('a');
    //         a.href = url;
    //         a.download = date+'HKSBQ.png';
    //         a.click(); 
    //     })
    //     .catch(function (error:any) {
    //         console.log(error)
    //     });
    // }
/******************** 生成作业图片END *********************/
   @Watch("height")
    heightChange() {
        this.style1 = "" + (this.height - 250) ;
    }
    /**
     * 导出数据
     */
    exportSorties(){
        let ref:any = this.$refs.SortiesTable;
        ref.exportData({ type: 'csv' })
        // const workBook = XLSX.utils.table_to_book(ref.$el.querySelector('.body--wrapper>.vxe-table--body'))
        // XLSX.writeFile(workBook, '架次.xlsx')
    }
}
</script>
<style scoped>
.sortiesQuery-vxe-toolbar{
    position: absolute;
    right: 34px;
    z-index: 999;
    background: unset;
    padding-bottom: 55px;
}
.myTMap{
    height: 902px;
    width: 1920px;
    outline: none;
}
.nav {
    padding-bottom: 10px;
    background-color: #f9f9f9;
}
.query {
    padding-top: 10px;
    padding-bottom: 5px;
    padding-right: 10px;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.sortdata {
    margin-top: 10px;
    padding: 20px;
     -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>