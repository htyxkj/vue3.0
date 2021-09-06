<template>
    <div class="bip-show">
        <template v-if="editorType==I_EDITOR_LIST &&bipInsAid">
            <bip-list-ref :bipInsAid="bipInsAid" :cell="cell" :model="model"></bip-list-ref>
        </template>
        <template v-else-if="editorType == 9 && bipInsAid && (bipInsAid.bType == 'CSelectEditor' || bipInsAid.bType == 'CGroupEditor'  || bipInsAid.bType == 'CDynaEditor'|| bipInsAid.bType == 'CGDicEditor' || bipInsAid.bType =='CTreePopEditor')">
            <bip-aid-ref :bipInsAid="bipInsAid" :cell="cell" :model="model" :cds="cds" :row="row"/>
        </template>
        <template v-else-if="bipInsAid && (bipInsAid.bType == 'CUpDownEditor')">
            <bip-file-ref :bipInsAid="bipInsAid" :cell="cell" :model="model" :cds="cds" :index="row"/>
        </template>
        <template v-else-if="editorType == I_EDITOR_CASCADER">
            <bip-cascader-ref :bipInsAid="bipInsAid" :cell="cell" :model="model"></bip-cascader-ref>        
        </template>
        <template v-else-if="editorType == I_EDITOR_SWITCH">
            <bip-switch-ref :bipInsAid="bipInsAid" :cell="cell" :model="model"></bip-switch-ref>
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

import BipCascaderRef from './BipCascaderRef.vue'
import BipListRef from './BipListRef.vue'
import BipAidRef from './BipAidRef.vue'
import BipFileRef from './BipFileRef.vue'
import BipGridShow from './BipGridShow.vue'
import BipSwitchRef from './BipSwitchRef.vue'
let ICL = CommICL
@Component({
    components:{BipListRef,BipGridShow,BipAidRef,BipFileRef,BipCascaderRef,BipSwitchRef}
})
export default class BipGridInfo extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    editorType:number = 0
    I_EDITOR_LIST = ICL.I_EDITOR_LIST
    I_EDITOR_NUM = ICL.I_EDITOR_NUM
    I_EDITOR_CASCADER = ICL.I_EDITOR_CASCADER
    I_EDITOR_SWITCH = ICL.I_EDITOR_SWITCH
    bipInsAid:BipInsAidNew|null = null
    @State("aidInfos", { namespace: "insaid" }) aidInfo: any;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    model:any = ''
    linkName:string = ""
    aidMarkKey:string = "";
    eventId:number = 0
    eventId1:number = 1
    mounted(){
        this.aidMarkKey = this.cds.ccells.obj_id + "_" + this.cell.id+'_';
        this.cellEdit()
        this.eventId = this.$bus.$on('cell_edit',this.cellEdit)
        this.eventId1 = this.$bus.$on('tableDatachange',this.dataloadchange)
        //获取关联】参照的CellId
        this.getLinkedName(this.cell)
    }

    getLinkedName(cell:Cell){
        this.editorType = cell.editType;
        let str = cell.refValue;
        if(str){
            if(str.startsWith("{")){
                str = str.substr(str.indexOf('{')+1,str.indexOf('}')-str.indexOf('{')-1)
                let c = str.charAt(0)
                str = str.substr(1,str.length);
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
        this.$bus.$off('tableDatachange',this.eventId1)
    }

    cellEdit(){
        let crd = this.cds.getRecordAtIndex(this.row>-1?this.row:0);
        if(crd){
            this.model = ''
            if(crd.data[this.cell.id] != undefined){
                this.model = (crd.data[this.cell.id]+'')||''
            }
        }else{
            this.model = ''
        }
    }

    dataloadchange(obj_id:string = ''){
        let crd = this.cds.getRecordAtIndex(this.row>-1?this.row:0);
        if(crd){
            this.model = ''
            if(crd.data[this.cell.id] != undefined){
                this.model = (crd.data[this.cell.id]+'')||''
            }
        }else{
            this.model = ''
        }
    }

    
    /**
     * 获取辅助类型
     */
    async getInsAidInfoBy(editName:string,bcl:boolean = false){
        let str = editName
        if(bcl){
            str = ICL.AID_KEYCL+this.aidMarkKey+str;
        }else{
             str = ICL.AID_KEY+this.aidMarkKey+str;
        }
        if(!this.inProcess.get(str)){
            let vv = this.aidInfo.get(str)
            if(!vv){
                vv  = window.sessionStorage.getItem(str)
                if(!vv){
                    let vars = {id:bcl?300:200,aid:editName,ak:this.aidMarkKey}
                    await this.fetchInsAid(vars);
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

    @Watch('aidInfo')
    mapChanges(){
        if(!this.bipInsAid){ 
            if(this.linkName){
                let rr = this.aidInfo.get(ICL.AID_KEY+this.aidMarkKey+this.linkName) ==null?this.aidInfo.get(ICL.AID_KEYCL+this.aidMarkKey+this.linkName):this.aidInfo.get(ICL.AID_KEY+this.aidMarkKey+this.linkName) 
                if(rr)
                    this.bipInsAid = rr
            } 
        }
    }
    @Watch("row")
    rowChange(){
        this.dataloadchange()
    }

    @Watch("cds.currRecord.data",{deep:true})
    dataChange(){
        this.dataloadchange()
    }
}
</script>


<style lang="scss">
.bip-show{
    width: 100%;
    padding: 0 0;
}
</style>
