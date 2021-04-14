<template>
  <el-row>
    <div class="bip-home-container">
      <template v-if="type == 'news'">
        <div class="main-title">
          <el-row>
            <el-col :span="20">
              <i class="iconfont icon-bip-menu"></i>
              {{sname}}
            </el-col>
          </el-row>
        </div>
        <el-scrollbar wrap-class="scrollbar-wrapper">
          <el-row v-for="(item,index) in ggList" :key="index" style="padding:3px 8px;">
            <div @click="showcontent(item.data.content)" class="new">
              <!-- <el-col :span="15">
                <el-row type="flex" justify="start">{{item.data.title}}</el-row>
              </el-col>
              <el-col :span="9">
                <el-row type="flex" justify="end">{{item.data.mkdate}}</el-row>
              </el-col>-->
              <el-row>
                <el-col :span="6">
                  <img
                    src="http://news.xinhuanet.com/politics/2016-09/18/129284700_14741694437441n.jpg"
                    alt
                  />
                </el-col>
                <el-col :span="18">
                  <el-row>
                    <el-col :span="24">
                      <div class="newtext title">{{item.data.title}}</div>
                    </el-col>
                    <!-- <el-col :span="10">
                      <div class="newtext mkdate">{{item.data.mkdate}}</div>
                    </el-col> -->
                  </el-row>
                  <el-row>
                    <div class="newtext newcontent">{{item.data.content}}</div>
                  </el-row>
                  <el-row>
                           <div class="mkdate">
                               {{item.data.mkdate}}
                           </div>
                  </el-row>
                </el-col>
              </el-row>
            </div>
          </el-row>
        </el-scrollbar>
      </template>
      <!-- <template v-else="type == 'bulletin'"> -->
      <template v-elseif="type == 'bulletin'">
        <div class="main-title">
          <el-row>
            <el-col :span="20">
              <i class="iconfont icon-bip-menu"></i>
              {{sname}}
            </el-col>
          </el-row>
        </div>
        <el-scrollbar wrap-class="scrollbar-wrapper">
          <el-row v-for="(item,index) in ggList" :key="index" style="padding:3px 8px;">
            <div @click="showcontent(item.data.content)" >
              <el-col :span="17">
                <div class="newstitle">· {{item.data.title}}</div>
              </el-col>
              <el-col :span="7">
                <div class="newstitletime">{{item.data.mkdate}}</div>
              </el-col>
            </div>
          </el-row>
        </el-scrollbar>
      </template>
    </div>
    <el-dialog title="内容" class="bipinsaid":visible.sync="showContentDialog" width="50%" :append-to-body="true">
      <p style="min-height:500px" v-html="content">{{content}}</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showContentDialog = false">取 消</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { Menu } from "@/classes/Menu";
import CDataSet from "@/classes/pub/CDataSet";
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
@Component({
  components: {}
})
export default class HomeNews extends Vue {
  @Prop() cont!: string;
  @Prop() rech!: string;
  @Prop() type!: string; //新闻或公告
  @Getter("menulist", { namespace: "login" }) menusList!: Menu[];
  @Getter('isLogin', { namespace: 'login' }) isLogin!: boolean;
  menuList: Array<any> = new Array<any>();
  showMenuList: boolean = false;
  selection: Array<any> = new Array<any>();
  optionalMenu: Array<any> = new Array<any>();
  ggList: Array<any> = new Array<any>();
  showContentDialog: boolean = false;
  content: string = "";
  sname:any = "";
  mounted() {
    this.init();
  }
  init() {
    if(this.cont){
      let cc = JSON.parse(this.cont);
      this.sname = cc.sname
    }
    let datastr = "";
    if (this.type == "news") {
      datastr = " slb = '1' ";
    } else if (this.type == "bulletin") {
      datastr = " slb = '0' ";
    }
    this.selectNewsList(datastr);
  }
  async selectNewsList(dataStr: string) {
    let qe: QueryEntity = new QueryEntity("HOMEOAGGTZ", "HOMEOAGGTZ", dataStr);
    qe.oprid = 14;
    qe.page.pageSize = 1000;
    let vv = await tools.query(qe);
    console.log(vv);
    if (vv.data.id == 0) {
      let cc = vv.data.data.data.data;
      this.ggList = cc;
      console.log(cc);
    }
  }
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

  showcontent(content: string) {
    if(!this.isLogin){
      this.$router.push({
        path:'/wlogin',
        name:'wlogin',
      })
      return;
    }
    let snkey = JSON.parse(window.sessionStorage.getItem('snkey')+'')
    snkey = encodeURIComponent(snkey);
    let cc = 'snkey='+snkey;
    this.content = content.replace(new RegExp('snkey={BIPSNKEY}','gm'),cc)
    this.showContentDialog = true;
  }
}
</script>
<style lang="scss" scoped>
.bip-home-container {
  // border: 1px solid #dedede;
  background-color: #ffffff;
  border-radius: 6px;
  position: fixed;
  height: calc(100%)  !important;
  z-index: 1;
  overflow: hidden;
  width: calc(100%) !important;
  color: #868D94;
  box-shadow: 1px 2px 10px #dde2e4;
  .el-scrollbar {
    height: 90%;
    margin-bottom: 10px !important;
    margin-right: 0px !important;
    .el-scrollbar__wrap {
      overflow-x: hidden !important;
      padding-right: 5px;
      height: 100%;
    }
    .scrollbar-wrapper {
      overflow-x: hidden !important;
    }
  }
}
.new img {
  height: 100%;
  width: 100%;
  background-size: 100% 100%;
}
.main-title {
  border-bottom: 2px solid #efefef;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  padding: 0 10px;
  color: #4A77FA;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 8px;

}
.new {
  margin-top: 10px;
  margin-right: 10px;
  margin-left: 10px;
}
.title {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.8px;
  color: #333333;
  
}
.mkdate {
    text-align: left;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    padding-left: 10px;  
    color: #888888;
}
.newtext {
  font-size: 13px;
  padding: 3px 5px 3px 10px;
}
.newcontent {
  font-size: 12px;
  // text-indent: 2em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.6;
  letter-spacing: 1px;
  color: #555555;
  margin: 2px 0
}
.newstitle {
  padding: 3px 0;
  font-size: 13px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.8px;
  color: #333333;
  
}
.newstitletime {
  padding: 3px 0;
  font-size: 13px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-align: right;
  color: #868D94;
}
</style>