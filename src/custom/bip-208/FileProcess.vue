<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="一键导出" name="first">
      <el-container>
        <el-header>
          <div class="search-box">
            <el-form label-width="115px" :inline="true">
              <el-form-item>
                <el-date-picker
                  v-model="timeValue1"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="编辑-开始时间"
                  end-placeholder="编辑-结束时间"
                  value-format="yyyy-MM-dd hh:mm:ss"
                  @change="mkdateChange"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item label="">
                <el-date-picker
                  v-model="timeValue2"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="最近更新-开始时间"
                  end-placeholder="最近更新-结束时间"
                  value-format="yyyy-MM-dd hh:mm:ss"
                  @change="moditimeChange"
                >
                </el-date-picker>
              </el-form-item>
               <el-button style="border:0px" type="success"  @click="reqfileMsg">      
                    <i class="el-icon-search"></i>
                    <span>查询</span>
                </el-button>
                <el-button style="border:0px" @click="reqfileMsg1" type="primary" >      
                    <i class="el-icon-download"></i>
                    <span>一键导出</span>
                </el-button>
            </el-form>
          </div>
        </el-header>
        <el-container>
          <el-aside width="400px">
            <div class="tree-box" :style="'height:'+tableHeight+'px'">
              <div class="buttons">
                <el-button @click="setCheckedKeys" size="mini" type="primary"
                  >全选</el-button
                >
                <el-button @click="resetChecked" size="mini" type="danger"
                  >清空</el-button
                >
              </div>
              <el-tree
                ref="sorgTree"
                :props="defaultProps"
                default-expand-all
                :data="sorgTree"
                show-checkbox
                node-key="orgcode"
                @check="currentChecked"
                :default-checked-keys="defaultcheckedkeys"
              >
              </el-tree>
            </div>
          </el-aside>
          <el-main>
            <el-table :data="tableData" :height="tableHeight" style="width: 100%" border>
              <el-table-column
                type="index"
                width="50"
                label="#"
                align="center"
              ></el-table-column>
              <el-table-column prop="name" label="名称"> </el-table-column>
              <el-table-column prop="qty" label="导出行数" align="center">
              </el-table-column>
            </el-table>
          </el-main>
        </el-container>
      </el-container>
    </el-tab-pane>
    <el-tab-pane label="一键导入" name="second">
        <el-row>
          <input style="margin-left:20px" type="file" accept=".zip" @change="imFile($event)" name="file" />

          <el-button style="border:0px" @click="importFile1" type="primary" :disabled="canImp">      
            <i class="el-icon-upload"></i>
            <span>导入</span>
          </el-button>
        </el-row>

        <el-main>
            <el-table :data="tableData2" :height="tableHeight" style="width: 100%" border>
              <el-table-column
                type="index"
                width="50"
                label="#"
                align="center"
              ></el-table-column>
              <el-table-column prop="name" label="名称"> </el-table-column>
              <el-table-column prop="qty" label="导出行数" align="center">
              </el-table-column>
            </el-table>
          </el-main>
      <!-- </a> -->

    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts">
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import CDataSet from "@/classes/pub/CDataSet";
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BipMenuBtn } from "@/classes/BipMenuBtn";
import { BaseVariable } from "@/utils/BaseICL";
import { GlobalVariable } from "@/utils/ICL";
@Component({
  components: {},
})
export default class Test extends Vue {
  @State('bipComHeight', { namespace: 'login' }) height!: number;
  cell: any = new CDataSet("");
  activeName: string = "first";
  @Provide() page: any = { pageSize: 100, currPage: 1, total: 0 };
  sorgTree: any = [];   //tree数据
  defaultProps: any = {
    label: "orgname",
    id: "orgcode",
  };  //tree默认的配置项
  defaultcheckedkeys: any = [];  //tree默认选中节点数组
  paramsData: any = {
    scm: [],
    mkdate: "",
    moditime: "",
  };  //条件
  tableData: any = []; //报表data
  tableData2:any = [];
  timeValue1 = [];
  timeValue2 = [];
  allTree: any = [];   //全部选中tree数据数组
  baseURL: string = ""; //项目URL
  tableHeight:any ="500"; //页面高度
  file:any = null
  canImp:boolean = true
  async created() {

    // 设置页面报表&&tree高度
    this.tableHeight =  this.height - 180

    // 获取项目路径
    this.baseURL = BaseVariable.BaseUri;

    // 获取部门信息
    this.getAssistData();

    // 从session缓存中获取当前登陆人所在公司
    let user:any =window.sessionStorage.getItem('user');
    let curr_scm =JSON.parse(user).deptInfo.cmcCode;
    // 设置tree 默认选中为当前人登录公司
    this.defaultcheckedkeys.push(curr_scm);
    // 设置tree当定的value为当前人登录公司
    this.paramsData.scm.push(curr_scm);

  }

  mounted() {}

  //获取对象
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

  //调用辅助查询部门数据
  async getAssistData() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = this.page.currPage;
    qe.page.pageSize = this.page.pageSize;
    let cont = "";
    qe.cont = cont;
    let cc = await tools.getBipInsAidInfo("SORG", 210, qe);
    if (cc.data.id == 0) {
      this.sorgTree = cc.data.data.data.values;
      for (let index = 0; index < this.sorgTree.length; index++) {
        const element = this.sorgTree[index].orgcode;
        this.allTree.push(element)
      }
    }
  }

  //   文件查询
  async reqfileMsg() {
     console.log(this.paramsData.scm);
    if (this.paramsData.scm == "") {
      return this.$message.error("请选择公司信息");
    }
    let btn1 = new BipMenuBtn("DLG", "查询");
    btn1.setDlgType("D");
    btn1.setDlgCont("zlgl.serv.ZLDataImpAndExpServ*220;0;0"); //同步
    let b = JSON.stringify(btn1);
    let scmv = "";
    this.paramsData.scm.forEach((v1: any) => {
      scmv += v1 + ",";
    });
    let prarm = {
      scm: scmv,
      mkdate: this.paramsData.mkdate,
      moditime: this.paramsData.moditime,
    };
    let v = JSON.stringify(prarm);
    let res = await tools.getDlgRunClass(v, b);
    // console.log(res);
    if (res.data.id !== 0) {
      return this.$message.error("查询失败");
    }
    this.tableData = res.data.data.list;
  }

  importFile1(){
    this.canImp = true
    this.tableData2 = []
    if(this.file!=null){
      let dfconfig:any = {
        headers: {
        'Content-Type': 'multipart/form-data'
        },
        params:{
            snkey:JSON.parse(window.sessionStorage.getItem('snkey')+''),
            usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
        }
      }
      console.log(this.file,this.file.name)
        let name = this.file.name
        let form = new FormData();
        let config  = dfconfig;
        config.params.name = name;
        config.params.dbid = BaseVariable.COMM_FLD_VALUE_DBID;
        config.params.apiId = "importexpdata2";
        config.params.dlgCont = "zlgl.serv.ZLDataImpAndExpServ*400;0;0"
        form.append("data", this.file); 
        form.append("name", name); 
        this.$message('数据导入中！');
        this.$axios.post(GlobalVariable.API,form,config).then((res)=>{
          console.log(res);
            if(res.data.id==-1){
                this.$notify.error("导入失败！");
                this.canImp = false
            }else{
                this.$notify.success( "导入完成！")
                this.tableData2 = res.data.data.list;
            }
        });
    }else{
      this.$message.error("请先选择压缩包！");
    }
   

  }

  imFile(event:any) {
    this.file = event.target.files[0];
    if(this.file){
      this.canImp = false
    }
  }

  // 一键下载
  async reqfileMsg1() {
    if (this.paramsData.scm == "") {
      return this.$message.error("请选择公司信息");
    }
    let btn1 = new BipMenuBtn("DLG", "一键下载");
    btn1.setDlgType("D");
    btn1.setDlgCont("zlgl.serv.ZLDataImpAndExpServ*200;0;0"); //同步
    let b = JSON.stringify(btn1);
    let scmv = "";
    this.paramsData.scm.forEach((v1: any) => {
      scmv += v1 + ",";
    });
    let prarm = {
      scm: scmv,
      mkdate: this.paramsData.mkdate,
      moditime: this.paramsData.moditime,
    };

    let v = JSON.stringify(prarm);
    let res = await tools.getDlgRunClass(v, b);
    // console.log(res);
    if (res.data.id !== 0) {
      return this.$message.error("文件下载失败");
    }
    this.tableData = res.data.data.list;
    window.open(this.baseURL + "/" + res.data.data.file);
  }

  // tree节点点击事件回调
  currentChecked(nodeObj: any, SelectedObj: any) {
    // console.log(SelectedObj)
    // console.log(SelectedObj.checkedNodes)  // 这是选中的节点数组
    this.paramsData.scm = SelectedObj.checkedKeys;  // 这是选中的节点的key数组
  }

  // 编辑日期发生变化
  mkdateChange() {
    this.paramsData.mkdate = `${this.timeValue1[0]}~${this.timeValue1[1]}`;
  }

  // 最近修改日期发生变化
  moditimeChange() {
    this.paramsData.moditime = `${this.timeValue2[0]}~${this.timeValue2[1]}`;
  }

  // tree-清空选中的公司
  resetChecked() {
   if(this.$refs.sorgTree){
       this.$nextTick(function () {
        (this.$refs.sorgTree as any).setCheckedKeys([]);
        this.paramsData.scm='';
      })
    }
  }

  // tree-全选公司
  setCheckedKeys() {
    if(this.$refs.sorgTree){
       this.$nextTick(function () {
        (this.$refs.sorgTree as any).setCheckedKeys(this.allTree);
        this.paramsData.scm = this.allTree;
      })
    }
  }

  // 监听页面高度发生变化
  @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -180
    }
}
</script>
<style lang="scss" scoped>

.search-box {
  border: 1px solid #ebeef5;
  padding: 10px 0px 5px 10px;
}
.tree-box {
    margin: 20px 0px 0px 20px;
    border: 1px solid #ebeef5;
    overflow-y: auto;
    .buttons {
      padding: 5px 0px 5px 0px;
      text-align: center;
      border-bottom: 1px solid #ebeef5;
    }
  }
</style>