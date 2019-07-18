<template>
    <div class="bip-show">
        <template v-if="editorType==I_EDITOR_LIST &&bipInsAid">
            <bip-list-ref :bipInsAid="bipInsAid" :cell="cell" :model="model"></bip-list-ref>
        </template>
        <template v-else-if="editorType == 9 &&bipInsAid && (bipInsAid.bType !== 'CDateEditor'||bipInsAid.bType !== 'CQueryEditor')">
            <bip-aid-ref :refLink="bipInsAid" :cell="cell" :model="model" />
        </template>
        <template v-else>
            <bip-grid-show :cell="cell" :model="model" />
        </template>
       
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { State, Action, Getter, Mutation } from "vuex-class";
import CDataSet from '../../../classes/pub/CDataSet';
import { Cell } from '../../../classes/pub/coob/Cell';
import {CommICL} from '@/utils/CommICL'
import { BIPUtils } from '@/utils/BaseUtil'
import BipInsAidNew from '../../../classes/BipInsAidNew';
let baseTool = BIPUtils.baseUtil

import BipListRef from './BipListRef.vue'
import BipAidRef from './BipAidRef.vue'
import BipGridShow from './BipGridShow.vue'
let ICL = CommICL
@Component({
    components:{BipListRef,BipGridShow,BipAidRef}
})
export default class BipGridInfo extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Provide() editorType:number = 0
    @Provide() I_EDITOR_LIST = ICL.I_EDITOR_LIST
    @Provide() I_EDITOR_NUM = ICL.I_EDITOR_NUM
    @Provide() bipInsAid:BipInsAidNew|null = null
    @State("aidInfos", { namespace: "insaid" }) aidInfo: any;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    @Provide() model:any = ''
    @Provide() linkName:string = ""
    @Provide() eventId:number = 0
    mounted(){
        
        this.cellEdit()
        this.eventId = this.$bus.$on('cell_edit',this.cellEdit)
        //获取关联】参照的CellId
        this.getLinkedName(this.cell)
    }

    getLinkedName(cell:Cell){
        let str = cell.refValue;
        if(str){
            if(str.startsWith("{")){
                str = str.substr(str.indexOf('{')+1,str.indexOf('}')-str.indexOf('{')-1)
                let c = str.charAt(0)
                str = str.substr(1,str.length);
                console.log(c)
                let bcl = c == '$'
                this.getInsAidInfoBy(str,bcl)
                this.linkName = str
                this.editorType = bcl?ICL.I_EDITOR_LIST:9 //9代表辅助的参照
            }else if(str.indexOf(';')>0||str.indexOf(':')>0){
                this.bipInsAid = baseTool.makeBipInsAidByStr(str,this.cell.id)  
                this.linkName = this.bipInsAid.id
                this.editorType = ICL.I_EDITOR_LIST
            }
        }else{
            if(cell.editName&&cell.assist){
                this.getInsAidInfoBy(cell.editName)
                this.linkName = cell.editName
                this.editorType = 9
            }
        }
    }
    beforeDestroy(){
        this.$bus.$off('cell_edit',this.eventId)
    }

    cellEdit(){
        let crd = this.cds.getRecordAtIndex(this.row>-1?this.row:0);
        if(crd)
            this.model = crd[this.cell.id]
    }

    
    /**
     * 获取辅助类型
     */
    async getInsAidInfoBy(editName:string,bcl:boolean = false){
        let str = editName
        if(bcl){
            str = ICL.AID_KEYCL+str;
        }else{
             str = ICL.AID_KEY+str;
        }
        if(!this.inProcess.get(str)){
            let vv = this.aidInfo.get(str)
            if(!vv){
                vv  = window.sessionStorage.getItem(str)
                if(!vv){
                    let vars = {id:bcl?300:200,aid:editName}
                    await this.fetchInsAid(vars);
                    console.log(this.aidInfo.get(str))
                }else{
                    this.bipInsAid = JSON.parse(vv)
                    let vals = {key:str,value:this.bipInsAid}
                    this.setAidInfo(vals)
                }
            }else{
                this.bipInsAid = vv;
            }
        }else{
            let vv = this.aidInfo.get(str)
            if(vv){
                 this.bipInsAid = vv;
            }
        }   
    }
}
</script>


<style lang="scss">
.bip-show{
    width: 100%;
    padding: 0 0;
}
</style>
