<template>
    <div>
        <template v-if="assit&&bipInsAid!=null"> 
            <template v-if="(bipInsAid.bType === 'CDateEditor') || (bipInsAid.bType === 'CHSMEditor')">
                <bip-date-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-date-editor>
            </template>
            <template v-else-if="bipInsAid.bType === 'CFlowEditor'">
                <bip-flow-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-flow-editor>
            </template>
            <template v-else-if="bipInsAid.bType === 'CUpDownEditor'">
                <bip-up-down-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-up-down-editor>
            </template>
            <template v-else-if="bipInsAid.bType === 'CQueryEditor'">
                <bip-query-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-query-editor>
            </template>
             <template v-else-if="bipInsAid.bType === 'CTreePopEditor'">
                <bip-tree-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row"></bip-tree-editor>
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
            <template v-else-if="editorType == I_EDITOR_RTEXT">
                <bip-rich-text-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row"></bip-rich-text-editor>
            </template>
            <template v-else>
                <bip-input-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row"></bip-input-editor>
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
import BipQueryEditor from './BipQueryEditor.vue'
import BipRichTextEditor from './BipRichTextEditor.vue'
import BipTreeEditor from './BipTreeEditor.vue'
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import { BIPUtils } from '@/utils/BaseUtil'
import BipInsAidNew from '../../classes/BipInsAidNew';
import CRecord from '../../classes/pub/CRecord';
let baseTool = BIPUtils.baseUtil
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
    components:{BipInputEditor,BipNumberEditor,BipListEditor,BipInsAidEditor,BipDateEditor,BipFlowEditor,BipUpDownEditor,BipQueryEditor,BipRichTextEditor,BipTreeEditor}
})
export default class BipCommEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() bgrid!:boolean
    @Prop() cdsCount!:CDataSet
    @Provide() editorType:number = 0
    @Provide() I_EDITOR_LIST = ICL.I_EDITOR_LIST
    @Provide() I_EDITOR_RTEXT = ICL.I_EDITOR_RTEXT
    // @Provide() I_EDITOR_DATE = ICL.I_EDITOR_DATE
    // @Provide() I_EDITOR_UPDOWN = ICL.I_EDITOR_UPDOWN
    // @Provide() I_EDITOR_SELECT = ICL.I_EDITOR_SELECT
    // @Provide() I_EDITOR_COMM = ICL.I_EDITOR_COMM
    @Provide() I_EDITOR_NUM = ICL.I_EDITOR_NUM
    // @Provide() I_EDITOR_COPY = ICL.I_EDITOR_COPY
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
    async mounted(){
            this.model = this.getModelValues();
            this.eventId = this.$bus.$on('cell_edit',this.getModelValues)
            this.bsearch = (this.cds.ccells.attr&0x80)>0
            this.assit = this.cell.assist
            if(this.assit){
                this.editName = this.cell.editName
                if(!this.inProcess.get(ICL.AID_KEY+this.editName)){
                    await this.getInsAidInfoBy(this.editName)
                }
            }else{
                //没有辅助，但是编辑器类型是下拉列表，需要处理参照信息
                let type = this.cell.type;
                console.log(this.cell.type)
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
                        }
                    }
                }else if(this.cell.editType == 10){
                    this.editorType = this.I_EDITOR_RTEXT
                }else if(type>=2&&type<12){
                    let str = this.cell.refValue
                    if(str){
                        if(str.indexOf('$')>0){
                            str = str.substr(str.indexOf('$')+1,-str.indexOf('$')+str.indexOf("}")-1);
                            this.editName = str
                            await this.getInsAidInfoBy(str,true)
                        }else{
                            str = str.substr(str.indexOf('&')+1,-str.indexOf('&')+str.indexOf("}")-1);
                            this.editName = str
                            await this.getInsAidInfoBy(str,false)
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
                    let rr = this.aidInfo.get(ICL.AID_KEY+this.editName)
                    if(rr)
                        this.bipInsAid = rr
                }
            }else{
                if(this.editorType == this.I_EDITOR_LIST){
                    let rr = this.aidInfo.get(ICL.AID_KEYCL+this.editName)
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
        let crd:CRecord = this.cds.getRecordAtIndex(this.row>-1?this.row:0);
        if(crd&&crd.data){
            this.model = crd.data[this.cell.id]
            if(this.model!=undefined || this.model!=null){
                this.model+=''
            }
        }else{
            this.model = '';
        }
        if(this.model ==''){
            let script = this.cell.script;
            if((this.cell.attr & 0x1000)<=0){
                if(script && script.indexOf("*")!=-1){
                    let cc = script.split("*");
                    let cds1  = this.cdsCount.getCdsByObjID(cc[0]);
                    if(cds1 && cds1.currRecord && cds1.currRecord.data)
                        this.model = cds1.currRecord.data[cc[1]]
                } 
            }
        }
        return this.model||''
    }

    /**
     * 获取辅助类型
     */
    async getInsAidInfoBy(editName:string,bcl:boolean = false){
        let str = editName
        if(bcl){
            str = ICL.AID_KEYCL+str;
        }else{
            str = ICL.AID_KEY+str
        }
        let vv = this.aidInfo.get(str)
        if(!vv){
            vv  = window.sessionStorage.getItem(str)
            if(!vv){
                let vars = {id:bcl?300:200,aid:editName}
                await this.fetchInsAid(vars);
            }else{
                this.bipInsAid = JSON.parse(vv)
                let vals = {key:str,value:this.bipInsAid}
                this.setAidInfo(vals)
            }
        }else{
            this.bipInsAid = vv;
        }
    }

    @Watch('model')
    modelChange(){
        this.$bus.$emit('datachange','')
        if(this.cds.currRecord)
        if(this.cds.currRecord.data[this.cell.id] != this.model){
            this.cds.currRecord.data[this.cell.id] = this.model
            this.cds.cdata.data[this.row] = this.cds.currRecord
        }
    }
}
</script>
