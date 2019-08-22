<template>
    <el-row>
        <div class="bip-home-container">
            <template v-if="type == 'news'">
                <div class="main-title">
                    <el-row>
                        <el-col :span="20">
                            <i class="iconfont icon-bip-menu"></i>
                            新闻中心
                        </el-col>
                    </el-row>
                </div> 
            </template>
            <template v-else="type == 'bulletin'">
                <div class="main-title">
                    <el-row>
                        <el-col :span="20">
                            <i class="iconfont icon-bip-menu"></i>
                            公告中心
                        </el-col>
                    </el-row>
                </div> 
            </template>
            <el-scrollbar wrap-class="scrollbar-wrapper">
                <el-row v-for="(item,index) in ggList" :key="index" style="padding:3px 8px;">
                    <span @click="showcontent(item.data.content)">
                        <el-col :span="15">
                            <el-row type="flex" justify="start">
                                {{item.data.title}}
                            </el-row>
                        </el-col>
                        <el-col :span="9">
                            <el-row type="flex" justify="end">
                                {{item.data.mkdate}}
                            </el-row>
                        </el-col>
                    </span>
                </el-row>
            </el-scrollbar>
        </div>
        <el-dialog title="内容"  class="bipinsaid" :visible.sync="showContentDialog" width="50%"  :append-to-body="true" >
            <p v-html="content">
                {{content}}
            </p>
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
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import CDataSet from "@/classes/pub/CDataSet"; 
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from '@/classes/search/QueryEntity';
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
@Component({
    components:{}
})
export default class HomeNews extends Vue { 
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Prop() type!:string;//新闻或公告
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Provide() menuList:Array<any> = new Array<any>();
    @Provide() showMenuList:boolean = false;
    @Provide() selection:Array<any> = new Array<any>();
    @Provide() optionalMenu:Array<any> = new Array<any>();
    @Provide() ggList:Array<any> = new Array<any>();
    @Provide() showContentDialog:boolean = false;
    @Provide() content:string = "";
    mounted() {   
        console.log("news")
        this.init();
    } 
    init(){
        let datastr = '';
        if(this.type =='news'){
            datastr = " slb = '1' ";
        }else if(this.type =='bulletin'){
            datastr = " slb = '0' ";
        }
        this.selectNewsList(datastr);
    }
    async selectNewsList(dataStr:string){
      let qe:QueryEntity = new QueryEntity("HOMEOAGGTZ","HOMEOAGGTZ",dataStr);
      qe.oprid = 14
      qe.page.pageSize=1000
      let vv = await tools.query(qe);
      console.log(vv);
      if(vv.data.id==0){
        let cc = vv.data.data.data.data; 
        this.ggList =cc;
        console.log(cc);
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

    showcontent(content:string){
        this.content = content;
        this.showContentDialog = true;
    }
}
</script>
<style lang="scss" scoped> 
.bip-home-container {
    border:  1px solid #dedede;
    background-color: #ffffff;
    position: fixed; 
    height: 95% !important;
    z-index: 1;
    overflow: hidden;  
    width: calc(100% - 7px) !important;
    .el-scrollbar {
        height: 90%;
        margin-bottom: 10px !important;
        margin-right: 0px !important; 
        .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
        }
        .scrollbar-wrapper{
        overflow-x: hidden !important;
        }
    }
}
.main-title{
    border-bottom:  1px solid #dedede;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    padding: 0 10px; 
}
</style>