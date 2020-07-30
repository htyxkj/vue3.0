<template>
  <div>
    <el-row style="padding: 5px 0px;">
      <el-button type="primary" icon="el-icon-search" size="mini" @click.native="select">查找</el-button>
      <el-button type="primary" icon="el-icon-files" size="mini" @click.native="exportDataEvent">导出</el-button>
      <el-button type="primary" icon="el-icon-printer" size="mini" @click.native="printEvent">打印</el-button>
    </el-row>
    <el-row class="bip-lay" >
      <el-form @submit.native.prevent label-position="right" label-width="100px">
        <div v-for="(cel,index) in tjCell.ccells.cels" :key="'A'+index" >
            <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="tjCell" :row="0" />
        </div> 
      </el-form>
    </el-row>
    <vxe-grid overflow ref="ybTable" align="center" border stripe resizable height="550" :columns="tableColumn" :span-method="rowspanMethod" :data="tableData"></vxe-grid>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { User } from "@/classes/User";
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
import CDataSet from "@/classes/pub/CDataSet";
import XLSX from "xlsx"
import moment from 'moment'
let tools = BIPUtil.ServApi;
@Component({
  components: {

  }
})
export default class AttendanceMonthly extends Vue {
  @Provide() page: any = { pageSize: 2000, currPage: 1, total: 0 };
  @Provide() kq_state:any=null;
  @Provide() kq_ybstate:any = {};
  @Provide() tableColumn:any=[];
  @Provide() tableData:any=[];
  @Provide() tjCell:CDataSet= new CDataSet("");
  @Provide() span_id:any={sorg:"sorg"};//合并列id
  @Provide() yymm:any=null;
  @Provide() sopr:any=null;
  @Provide() sorg:any=null;
  rcellID:any = "KQ0335";
  rcell:CDataSet = new CDataSet("");
  rightData:any =[];
  dateYMArr:any = [];

  async created() {
    this.tjCell = await this.getCell("KQ1020TJ");
    this.rcell = await this.getCell(this.rcellID);
    await this.initRightCellData();
    this.tjCell.createRecord();
        this.tjCell.currRecord.data.yymm = (new Date().getFullYear()*100+new Date().getMonth()+1)+'~'+(new Date().getFullYear()*100+new Date().getMonth()+1);
    this.assemblyTableColumn();//组成表头
  } 
  async initRightCellData(){
    let qe:QueryEntity = new QueryEntity(this.rcellID,this.rcellID);
    qe.page.pageSize = 10000;
    let res = await this.rcell.queryData(qe);
    if(res.data.id ==0 ){
      let data = res.data.data.data;
      this.rightData = data.data;
    }
  }
  async select(){
    this.sopr = this.tjCell.currRecord.data.sopr;
    this.sorg = this.tjCell.currRecord.data.sorg;
    this.yymm = this.tjCell.currRecord.data.yymm;
    let bok = this.checkNotNull(this.tjCell);
    if (!bok) return;
    const loading = this.$loading({
      lock: true,
      text: '加载中',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    }); 
    this.assemblyTableColumn();//组成表头
    await this.getkqstate();
    for(var i=0;i<this.dateYMArr.length;i++){
      await this.getkqybdetil(this.dateYMArr[i],this.dateYMArr[i]);
    }
    if(this.dateYMArr.length>1){
      await this.getkqybdetil(this.dateYMArr[0],this.dateYMArr[this.dateYMArr.length-1]);
    }
    this.assemblyTableData();
    loading.close();
  }
  async getkqstate(){
    let qe:QueryEntity = new QueryEntity('','');
    qe.page.currPage = 1;
    qe.page.pageSize = 20000;
    qe.cont = "";

    let allCont = [];
    let oneCont = []; 
    //classes/search/QueryCont'; 有详细说明
    let qCont = new QueryCont('hpdate','2019-11-01',12);
    if(this.yymm){ 
       let styymm = this.yymm.split("~")[0];
      let edyymm = this.yymm.split("~")[1];
      let qCont = new QueryCont('hpdate1',styymm,12);
      qCont.setContrast(1);
      qCont.setLink(1);
      oneCont.push(qCont); 
      qCont = new QueryCont('hpdate1',edyymm,12);
      qCont.setContrast(2);
      qCont.setLink(1);
      oneCont.push(qCont); 
    }
    if(this.sopr){
      qCont = new QueryCont('sopr',this.sopr,12);
      qCont.setContrast(0);
      qCont.setLink(1);
      oneCont.push(qCont);
    }
    if(this.sorg){
      qCont = new QueryCont('sorg',this.sorg,12);
      qCont.setContrast(0);
      qCont.setLink(1);
      oneCont.push(qCont);
    }

    if(oneCont.length !=0){
      allCont.push(oneCont);
    qe.cont = "~" + JSON.stringify(allCont);
    }else{
      qe.cont = "";
    }
    let vv = await tools.getBipInsAidInfo('KQYB_LEFT',210,qe);
    if(vv.data.id ==0){
      this.kq_state = vv.data.data.data.values
    }
  } 
  async getkqybdetil(styymm:any,edyymm:any){
    let qe:QueryEntity = new QueryEntity('','');
    qe.page.currPage = 1;
    qe.page.pageSize = 20000;
    qe.cont = "";
    let yymm = styymm+""+edyymm;
    if(styymm == edyymm){
      yymm = styymm
    }
    let allCont = [];
    let oneCont = []; 
    //classes/search/QueryCont'; 有详细说明
    let qCont = new QueryCont('yymm',this.yymm,12);
    if(styymm && edyymm){ 
      let qCont = new QueryCont('yymm',styymm,12);
      qCont.setContrast(1);
      qCont.setLink(1);
      oneCont.push(qCont); 
      qCont = new QueryCont('yymm',edyymm,12);
      qCont.setContrast(2);
      qCont.setLink(1);
      oneCont.push(qCont); 
    }
    if(this.sopr){
      qCont = new QueryCont('sopr',this.sopr,12);
      qCont.setContrast(0);
      qCont.setLink(1);
      oneCont.push(qCont);
    }
    if(this.sorg){
      qCont = new QueryCont('sorg',this.sorg,12);
      qCont.setContrast(0);
      qCont.setLink(1);
      oneCont.push(qCont);
    }
    if(oneCont.length !=0){
    allCont.push(oneCont);
    qe.cont = "~" + JSON.stringify(allCont);
    }else{
      qe.cont = "";
    }
    let vv = await tools.getBipInsAidInfo('KQYB_RIGHT',210,qe);
    if(vv.data.id ==0){
      let values = vv.data.data.data.values;
      for(var i=0;i<values.length;i++){
        let vl:any = {};
        for(var key in values[i]){
          let vlue =  values[i][key]
          key = key.substring(key.indexOf("(")+1,key.indexOf(")"));
          if(key !="sopr" && key != "sorg" && key != "yymm"){
            key = yymm+key;
          }
          vl[key] = vlue;
        }
        let cc = styymm+"~"+edyymm;
        if(styymm == edyymm){
          cc = styymm
        }
        vl[yymm+"kqyf"] = cc;
        this.kq_ybstate[yymm+""+values[i].sopr] = vl;
      }
    }
  }
  //组成表头
  assemblyTableColumn(){
    if(this.yymm == null){
      this.yymm = (new Date().getFullYear()*100+new Date().getMonth()+1)+'~'+(new Date().getFullYear()*100+new Date().getMonth()+1);
    }
    let styymm = this.yymm.split("~")[0];
    let edyymm = this.yymm.split("~")[1];
    let styear = styymm.substring(0,4);
    let stmonth = styymm.substring(4,styymm.length);
    let edyear = edyymm.substring(0,4);
    let edmonth = edyymm.substring(4,edyymm.length);
    let stTime = new Date(styear,stmonth-1,1);
    let edTime = new Date(edyear,edmonth,0);
    let t1 = moment(stTime).format("YYYY-MM-DD")
    let t2 = moment(edTime).format("YYYY-MM-DD")
    let dateArr = this.getAllData(stTime,edTime); 
    dateArr.splice(0,0,t1)
    dateArr.push(t2);
    this.tableColumn = [
      { type: 'seq', width: 50, fixed:"left"},
      { field: 'sorg', title: '部门' ,width: 60 ,fixed:"left"},
      { field: 'name', title: '姓名' ,width: 60 ,fixed:"left"},
    ]
    let month = 0
    let columnD:any =  { title: "", children: [ ] }
    let dateYM:any = [];
    for(var i=0;i<dateArr.length;i++){
      let d = dateArr[i];
      let date = new Date(d);
      let m = date.getMonth()+1;
      let y = date.getFullYear();

      let _m = null;
        if(m<10){
          _m = "0"+m;
        }else{
          _m = m;
        }
      if(dateYM.indexOf(y+""+_m) ==-1){
        dateYM.push(y+""+_m)
      }
      if(i==0){
        month = m
      }
      if(m != month){
        this.tableColumn.push(columnD);
        columnD =  { title: "", children: [ ] }
        month = m
      }
      columnD.title = y+'年'+m+'月'
      let column:any = { field: 'day'+(date.getMonth())+(date.getDate()), title: date.getDate() ,width: 60}
      columnD.children.push(column);
      if(i == dateArr.length-1){
        this.tableColumn.push(columnD);
        columnD =  { title: "", children: [ ] }
        month = m
      }
    }
    this.dateYMArr = dateYM;
    for(var j=0;j<dateYM.length;j++){
      let yymm = dateYM[j];
      let tableColumn1:any =[];
      let column:any = { field: yymm+"kqyf", title: "考勤月份" ,width: 80}
      tableColumn1.push(column)
      for(var i =0;i<this.rightData.length;i++){
        let d1 = this.rightData[i].data;
        let column  = {};
        if(d1.title1){
          column =  { title: d1.title1,
            children: [
              { field: yymm+d1.field, title: d1.title ,width: d1.width}
            ]
          }
        }else{
          column = { field: yymm+d1.field, title: d1.title ,width: d1.width}
        }
        tableColumn1.push(column)
      }
      this.tableColumn = this.tableColumn.concat(tableColumn1)
    }
    if(dateYM.length>1){
      let styymm = dateYM[0];
      let edyymm = dateYM[dateYM.length-1];
      let yymm = styymm+""+edyymm;
      let tableColumn1:any =[];
      let column = { field: yymm+"kqyf", title: "考勤月份" ,width: 140}
      tableColumn1.push(column)
      for(var i =0;i<this.rightData.length;i++){
        let d1 = this.rightData[i].data;
        let column  = {};
        if(d1.title1){
          column =  { title: d1.title1,
            children: [
              { field: yymm+d1.field, title: d1.title ,width: d1.width}
            ]
          }
        }else{
          column = { field: yymm+d1.field, title: d1.title ,width: d1.width}
        }
        tableColumn1.push(column)
      }
      this.tableColumn = this.tableColumn.concat(tableColumn1)
    }
  }
  //获取两个日期间的全部日期
  getAllData(date1:any, date2:any) {   
     if (date1 > date2) {  
         var tempDate = date1;  
         date1 = date2;  
         date2 = tempDate;  
     }  
     date1.setDate(date1.getDate() + 1);  
     var dateArr = [];  
     var i = 0;  
     while (!(date1.getFullYear() == date2.getFullYear()  
             && date1.getMonth() == date2.getMonth() && date1.getDate() == date2  
             .getDate())) {  
          var dayStr =date1.getDate().toString();  
          if(dayStr.length ==1){  
            dayStr="0"+dayStr;  
          }  
          var monthStr = (date1.getMonth() + 1).toString();
          if(monthStr.length ==1){  
            monthStr="0"+monthStr;  
          }  
         dateArr[i] = date1.getFullYear() + "-" + monthStr + "-"  
                 + dayStr;  
         i++;   
         date1.setDate(date1.getDate() + 1);  
     }
    return dateArr;  
  }
  //组成table数据
  assemblyTableData(){
    this.tableData=[];
    let sopr = "";
    let name = "";
    let ym = "";
    let data:any={};
    for(var i=0;i<this.kq_state.length;i++){
      let v1 = this.kq_state[i];
      let hpdate = v1.hpdate;
      hpdate = hpdate.replace(/-/g,"/"); 
      hpdate = new Date(hpdate);
      let sopr1 = v1.sopr;
      let name1 = v1.name;
      if(sopr !="" && sopr !=sopr1){
        data["name"] = name;
        for(var j=0;j<this.dateYMArr.length;j++){
          let ym = this.dateYMArr[j]
          data= Object.assign(data,this.kq_ybstate[ym+""+sopr]);
        }
        if(this.dateYMArr.length>1){
          let ym = this.dateYMArr[0] + "" + this.dateYMArr[this.dateYMArr.length-1]
          data= Object.assign(data,this.kq_ybstate[ym+""+sopr]);
        }
        this.tableData.push(data);
        data={};
      }
      data['day'+(hpdate.getMonth())+(hpdate.getDate())] = v1.kq_ybstate;
      sopr = sopr1;
      name = name1; 
      if(i == this.kq_state.length-1){
        data["name"] = v1.name;
        for(var j=0;j<this.dateYMArr.length;j++){
          let ym = this.dateYMArr[j]
          data= Object.assign(data,this.kq_ybstate[ym+""+v1.sopr]);
        }
        if(this.dateYMArr.length>1){
          let ym = this.dateYMArr[0] + "" + this.dateYMArr[this.dateYMArr.length-1]
          data= Object.assign(data,this.kq_ybstate[ym+""+sopr]);
        }
        this.tableData.push(data);
      }
    }
  }
  //行合并
  rowspanMethod(row:any) {
    let $rowIndex = row.$rowIndex;
        let data = row.data;
        let column = row.column;
        if(this.span_id !=null){ 
            let prevRow = data[$rowIndex - 1]
            let nextRow = data[$rowIndex + 1]
            if (this.span_id[column.property]) {
                let cellValue = row.row[column.property];
                if (prevRow && prevRow[column.property] === cellValue) {
                    return {rowspan: 0,colspan: 0}
                }else{
                    let countRowspan = 1
                    while (nextRow && nextRow[column.property] === cellValue) {
                        nextRow = data[++countRowspan + $rowIndex]
                    }
                    if (countRowspan > 1) {
                        return { rowspan: countRowspan, colspan: 1 }
                    }
                }
            }
        }
  }
  //导出数据
  exportDataEvent(){
    console.log("导出")
    // this.exportEvent ();
    let tb:any = this.$refs.ybTable;
    if(tb){
      tb.exportData({
          filename: '考勤月报',
          data: this.tableData
        })
    }
  }
  exportEvent () {
    let tb:any = this.$refs.ybTable;
    if(tb){
      // 转换数据
      let header = tb.$el.querySelector('.body--wrapper>.vxe-table--header')
      let hesheet = XLSX.utils.table_to_sheet(header)
      let table = tb.$el.querySelector('.body--wrapper>.vxe-table--body')
      let book = XLSX.utils.book_new()
      let sheet = XLSX.utils.table_to_sheet(table)
      XLSX.utils.book_append_sheet(book, sheet)
      let wbout = XLSX.write(book, { bookType: 'xlsx', bookSST: false, type: 'binary' })
      let blob = new Blob([this.toBuffer(wbout)], { type: 'application/octet-stream' })
      // 保存导出
      this.exportFilesServ(blob, '考勤月报')
      // FileSaver.saveAs(blob, '考勤月报.xlsx')
    }
  }
  /**导出Excel */
  exportFilesServ(content:any,title:string){
    const blob = new Blob([content]);
    const fileName = title+'.xlsx'
    if ('download' in document.createElement('a')) { // 非IE下载
      const elink = document.createElement('a')
      elink.download = fileName
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href) // 释放URL 对象
      document.body.removeChild(elink)
    } else { // IE10+下载
      navigator.msSaveBlob(blob, fileName)
    }
  }
  toBuffer (wbout:any) {
    let buf = new ArrayBuffer(wbout.length)
    let view = new Uint8Array(buf)
    for (let index = 0; index !== wbout.length; ++index) view[index] = wbout.charCodeAt(index) & 0xFF
    return buf
  }
  //打印数据
  printEvent(){
    let tb:any = this.$refs.ybTable;
    if(tb){
      tb.print() 
    }
  }
  async getCell(cellid:string){
    let res = await tools.getCCellsParams(cellid); 
    let rtn: any = res.data; 
    if (rtn.id == 0) {
      let kn: Array<Cells> = rtn.data.layCels;
      let cells = kn; 
      return new CDataSet(cells[0]);  
    }else{
      return new CDataSet('');
    }
  }
  checkNotNull(cds: CDataSet): boolean {
    let bok = true;
    cds.ccells.cels.forEach(item => {
      if (item.unNull && bok) {
        let vl = null;
        let hide: any = [];
        if (cds.currRecord.data[item.id] != null)
          vl = cds.currRecord.data[item.id] + "";
        if (!vl && hide.indexOf(item.id) == -1) {
          this.$notify.warning("【" + item.labelString + "】不能为空!");
          bok = false;
          return false;
        }
      }
    });
    return bok;
  }
}
</script>
<style  lang="scss" >

</style>