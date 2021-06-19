<template>
    <el-row :id="sid" style="height:100%">
        <template v-if="message">
            <div style="  text-align: center;">
                {{message}}
            </div>
        </template>
        <template v-else-if="uriParams.pclass=='inetbas.cli.systool.CUnivSelect' || uriParams.pclass=='inetbas.cli.systool.CRptTool'">
            <home-c-univ-select :uriParams="uriParams" :params="$route.params" :height='chartHeight' :cont="cont" @openMenu="openMenu" :config="config"></home-c-univ-select>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request"; 
import { URIParams } from "@/classes/URIParams";
import HomeCUnivSelect from './HomeCUnivSelect.vue'
let tools = BIPUtil.ServApi
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
@Component({
    components:{HomeCUnivSelect}
})
export default class HomeReport extends Vue { 
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Prop() sid!:string;
    @Prop() type!:string;
    config:any = {type:3};
    menuid:string = '';
    uriParams: URIParams = new URIParams();
    message:any = null;
    chartHeight:number = 400;
    componentsizechangeBusID:any = null;
    mounted() {   
        this.message = null;
        this.init();
        setTimeout(() => {
            var x:any =document.getElementById(this.sid);
            if(x)
                this.chartHeight = x.clientHeight-42
        }, 200);        
        this.componentsizechangeBusID= this.$bus.$on('componentsizechange',this.itemChange)
    }
    async init(){
        let cont = JSON.parse(this.cont) 
        let rech:any = {};
        if(this.rech){
            rech = JSON.parse(this.rech)
        }
        this.menuid = cont.menuid;
        let menu = baseTool.findMenu(this.menuid); 
        if(menu ==  null){
            this.message = "没有菜单"+this.menuid+"操作权限！";
            this.$notify.error("没有菜单"+this.menuid+"操作权限！");
            return;
        }
        let pbuid = menu.command.split("&")[0].split("=")[1];
        let res = await tools.getMenuParams(pbuid,this.menuid);
        if (res.data.id === 0 ) {
            let uri = res.data.data.mparams;
            if(this.type == "Report"){//报表统计模式
                console.log("报表统计模式")
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
            }
            this.uriParams = uri;
        } else {
            console.log(res);
            this.$notify.error("没有菜单参数！");
        } 

    }
    @Watch("cont")
    contChange(){
        this.init();
    }
    itemChange(){
        var x:any =document.getElementById(this.sid);
        if(x)
            this.chartHeight = x.clientHeight-42
    }
    beforeDestroy(){
        this.$bus.$off('componentsizechange',this.componentsizechangeBusID)
    }
    /**
     * 打开菜单
     */
    openMenu(){
        let menu = baseTool.findMenu(this.menuid); 
        let command = menu.command;
        if(command){
            let p = command.split("&");
            let pbuid = p[0].split("=")
            let pmenuid = p[1].split("=")
            this.$router.push({
                path:'/layout',
                name:'layout',
                query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
            })    
        }
    }
}
</script>