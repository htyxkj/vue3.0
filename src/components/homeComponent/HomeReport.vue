<template>
    <el-row >
        <template v-if="message">
            <div style="  text-align: center;">
                {{message}}
            </div>
        </template>
        <template v-else-if="uriParams.pclass=='inetbas.cli.systool.CUnivSelect' || uriParams.pclass=='inetbas.cli.systool.CRptTool'">
            <c-univ-select :uriParams="uriParams" :params="$route.params"></c-univ-select>
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
@Component({
    components:{CUnivSelect}
})
export default class BipStatisticsDialog extends Vue { 
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Provide() menuid:string = '';
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Provide() uriParams: URIParams = new URIParams();
    @Provide() message:any = null;
    mounted() {   
        this.message = null;
        this.init();
    }
    async init(){
        let cont = JSON.parse(this.cont) 
        let rech = JSON.parse(this.rech)
        this.menuid = cont.menuid;
        let menu = null;
        for(let i = 0;i<this.menusList.length;i++){
            let m1 = this.findMenuById(this.menuid,this.menusList[i])
            if(m1!=null){
                menu = m1
                break ;
            }
        }  
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
    findMenuById(menuId:string,menu:Menu):any{
        if(menu.menuId==menuId){
            return menu
        }else{
            if(menu.haveChild){
                for(let i = 0;i<menu.childMenu.length;i++){
                    let m1 = this.findMenuById(menuId,menu.childMenu[i])
                    if(m1!=null){
                        return m1;
                    }
                }
            }
            return null;
        }
    }
}
</script>