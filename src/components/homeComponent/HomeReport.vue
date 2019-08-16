<template>
    <el-row :id="sid" style="height:100%">
        <template v-if="message">
            <div style="  text-align: center;">
                {{message}}
            </div>
        </template>
        <template v-else-if="uriParams.pclass=='inetbas.cli.systool.CUnivSelect' || uriParams.pclass=='inetbas.cli.systool.CRptTool'">
            <c-univ-select :uriParams="uriParams" :params="$route.params" :height='chartHeight'></c-univ-select>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import { Menu } from "@/classes/Menu";
import { BIPUtil } from "@/utils/Request"; 
import { URIParams } from "@/classes/URIParams";
import CUnivSelect from './CUnivSelect.vue'
let tools = BIPUtil.ServApi
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
@Component({
    components:{CUnivSelect}
})
export default class HomeReport extends Vue { 
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Prop() sid!:string;
    @Provide() menuid:string = '';
    @Provide() uriParams: URIParams = new URIParams();
    @Provide() message:any = null;
    @Provide() chartHeight:number = 400;
    @Provide() componentsizechangeBusID:any = null;
    mounted() {   
        this.message = null;
        this.init();
        setTimeout(() => {
            var x:any =document.getElementById(this.sid);
            this.chartHeight = x.clientHeight     
        }, 200);        
        this.componentsizechangeBusID= this.$bus.$on('componentsizechange',this.itemChange)
        console.log(this.chartHeight)
    }
    async init(){
        let cont = JSON.parse(this.cont) 
        let rech = JSON.parse(this.rech)
        this.menuid = cont.menuid;
        let menu = baseTool.findMenu(this.menuid); 
        if(menu ==  null){
            this.message = "没有菜单"+this.menuid+"操作权限！";
            this.$notify.error("没有菜单"+this.menuid+"操作权限！");
            return;
        }
        let pbuid = menu.command.split("&")[0].split("=")[1];
        let res = await tools.getMenuParams(pbuid,this.menuid);
        if (res.data.id === 0) {
            let uri = res.data.data.mparams;
            uri.bgroupList = [];
            let cc = {selGroup:"",selValue:"",chartTypeValue:'',showChart:false,width:24,title:''};
            cc.selGroup = cont.spbds.split(",");
            cc.selValue = cont.spflds.split(",");
            cc.title = cont.sname;
            cc.chartTypeValue = cont.charttype;
            cc.showChart = cont.showchart ==1?true:false;
            uri.bgroupList.push(cc);
            uri.bgroup = cont.showchart ==1?true:false;
            let ptran = "";
            for(var key in rech){
                ptran+= key+"="+rech[key]+"&"
            };
            if(ptran.length>1)
            ptran = ptran.substring(0,ptran.length-1);
            let pbds = {ptran:ptran};
            uri.pbds = pbds
            this.uriParams = uri;
        } else {
            this.$notify.error("没有菜单参数！");
        } 

    }
    @Watch("cont")
    contChange(){
        this.init();
    }
    itemChange(){
        var x:any =document.getElementById(this.sid);
        this.chartHeight = x.clientHeight 
    }
    beforeDestroy(){
        this.$bus.$off('componentsizechange',this.componentsizechangeBusID)
    }
}
</script>