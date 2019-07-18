<template>
    <div>
        <template v-if="assit&&bipInsAid">
            <template v-if="(bipInsAid.bType === 'CDateEditor')">
                <bip-date-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-date-editor>
            </template>
            <template v-else-if="bipInsAid.bType === 'CFlowEditor'">
                <bip-flow-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-flow-editor>
            </template>
            <template v-else-if="bipInsAid.bType === 'CUpDownEditor'">
                <bip-up-down-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-up-down-editor>
            </template>
            <template v-else>
                <bip-ins-aid-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-ins-aid-editor>
            </template>    
        </template>
        <template v-else>
            <template v-if="editorType==I_EDITOR_NUM">
                <bip-number-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row"></bip-number-editor>
            </template>
            <template v-else-if="editorType==I_EDITOR_LIST">
                <bip-list-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-list-editor>
            </template>
            <template v-else>
                <bip-input-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid"></bip-input-editor>
            </template>   
        </template>  
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { State, Action, Getter, Mutation } from "vuex-class";
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipInputEditor from './BipInputEditor.vue'
import BipNumberEditor from './BipNumberEditor.vue'
import BipListEditor from './BipListEditor.vue'
import BipInsAidEditor from './BipInsAidEditor.vue'
import BipDateEditor from './BipDateEditor.vue'
import BipFlowEditor from './BipFlowEditor.vue'
import BipUpDownEditor from './BipUpDownEditor.vue'
import {CommICL} from '@/utils/CommICL'
import { BIPUtils } from '@/utils/BaseUtil'
import BipInsAidNew from '../../classes/BipInsAidNew';
import { assit } from '../../store/modules/assist';
import { constants } from 'crypto';
let ICL = CommICL
let baseTool = BIPUtils.baseUtil
@Component({
    components:{BipInputEditor,BipNumberEditor,BipListEditor,BipInsAidEditor,BipDateEditor,BipFlowEditor,BipUpDownEditor}
})
export default class BipCommEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() bgrid!:boolean
    @Provide() editorType:number = 0
    @Provide() I_EDITOR_LIST = ICL.I_EDITOR_LIST
    @Provide() I_EDITOR_NUM = ICL.I_EDITOR_NUM
    @Provide() model:any = ''
    @Provide() bsearch:boolean = false
    @Provide() assit:boolean = false
    @Provide() editName:any = ''
    @Provide() bipInsAid:BipInsAidNew|null = null
    @State("aidInfos", { namespace: "insaid" }) aidInfo: any;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    @Provide() eventId:number = 0
    mounted(){
            this.model = this.getModelValues();
            this.eventId = this.$bus.$on('cell_edit',this.getModelValues)
            this.bsearch = (this.cds.ccells.attr&0x80)>0
            this.assit = this.cell.assist
            if(this.assit){
                this.editName = this.cell.editName
                if(!this.inProcess.get(this.editName)){
                    console.log(this.editName)
                    this.getInsAidInfoBy(this.editName)
                }
            }else{
                //没有辅助，但是编辑器类型是下拉列表，需要处理参照信息
                let type = this.cell.type;
                if(this.cell.editType === 1){
                    this.editorType = this.I_EDITOR_LIST
                    let str = this.cell.refValue
                    if(str){
                        if(str.indexOf('$')>0){
                            str = str.substr(str.indexOf('$')+1,-str.indexOf('$')+str.indexOf("}")-1);
                            this.editName = str
                            this.getInsAidInfoBy(str,true)
                        }else{
                            this.bipInsAid = baseTool.makeBipInsAidByStr(str,this.cell.id)
                            console.log(str,this.bipInsAid)
                        }
                    }
                }else if(type>=2&&type<12){
                    let str = this.cell.refValue
                    if(str){
                        if(str.indexOf('$')>0){
                            str = str.substr(str.indexOf('$')+1,-str.indexOf('$')+str.indexOf("}")-1);
                            this.editName = str
                            this.getInsAidInfoBy(str,true)
                        }else{
                            str = str.substr(str.indexOf('&')+1,-str.indexOf('&')+str.indexOf("}")-1);
                            this.editName = str
                            this.getInsAidInfoBy(str,false)
                            console.log(str)
                        }
                         this.editorType = this.I_EDITOR_LIST
                    }else
                        this.editorType = this.I_EDITOR_NUM
                }
            }
    }

    beforeDestroy(){
        this.$bus.$off('cell_edit',this.eventId)
    }

    updated(){
        this.mapChanges()
    }

    @Watch('aidInfo')
    mapChanges(){
        if(!this.bipInsAid){
            if(this.assit){
                if(this.editName){
                    let rr = this.aidInfo.get(this.editName)
                    console.log(rr)
                    if(rr)
                        this.bipInsAid = rr
                }
            }else{
                if(this.editorType == this.I_EDITOR_LIST){
                    let rr = this.aidInfo.get('$'+this.editName)
                    console.log(rr,'321321')
                    if(rr)
                        this.bipInsAid = rr
                }
            }
        }

    }

    get value(){
        return this.getModelValues();
    }

    /**
     * 获取当前cell绑定的值
     */
    getModelValues(){
        let crd:any = this.cds.getRecordAtIndex(this.row>-1?this.row:0);
        if(crd){
            this.model = crd[this.cell.id]
            if(this.model!=undefined || this.model!=null){
                this.model+=''
            }
        }
        return this.model||''
    }

    /**
     * 获取辅助类型
     */
    getInsAidInfoBy(editName:string,bcl:boolean = false){
        let str = editName

        if(bcl){
            str = '$'+str;
        }
        let vv = this.aidInfo.get(str)
        if(!vv){
            vv  = window.sessionStorage.getItem(str)
            if(!vv){
                let vars = {id:bcl?300:200,aid:editName}
                console.log(vars,this.cell.id,this.editName,this.cell.refValue)
                this.fetchInsAid(vars);
                console.log(this.aidInfo.get(str))
            }else{
                this.bipInsAid = JSON.parse(vv)
                let vals = {key:str,value:this.bipInsAid}
                this.setAidInfo(vals)
            }
        }else{
            this.bipInsAid = vv;
        }
    }
}
</script>
