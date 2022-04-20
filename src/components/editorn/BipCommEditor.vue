<template>
    <div>
        <template v-if="(assit&&bipInsAid!=null) || isOtherDate"> 
            <template  v-if="isOtherDate || (bipInsAid.bType === 'CDateEditor') || (bipInsAid.bType === 'CHSMEditor') || (bipInsAid.bType === 'CYMEditor')">
                <bip-date-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @focus="focus"></bip-date-editor>
            </template>
            <template v-else-if="bipInsAid.bType === 'CFlowEditor'">
                <bip-flow-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @focus="focus"></bip-flow-editor>
            </template>
            <template v-else-if="bipInsAid.bType === 'CUpDownEditor'">
                <bip-up-down-editor class="BJstyle" :env="env" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @focus="focus"></bip-up-down-editor>
            </template>
            <template v-else-if="bipInsAid.bType === 'CQueryEditor'">
                <bip-query-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @focus="focus" :env="env"></bip-query-editor>
            </template>
             <template v-else-if="bipInsAid.bType === 'CTreePopEditor'">
                <bip-tree-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @focus="focus"></bip-tree-editor>
            </template>
            <template v-else>
                <bip-ins-aid-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @refInsAid="refInsAid" :ref="cell.id+'insaid'" :env="env" @focus="focus"></bip-ins-aid-editor>
            </template>    
        </template>
        <template v-else>
            <template v-if="editorType==I_EDITOR_NUM">
                <bip-number-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row" @focus="focus"></bip-number-editor>
            </template>
            <template v-else-if="editorType==I_EDITOR_SWITCH">
                <bip-switch-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row" @focus="focus"></bip-switch-editor>
            </template>
            <template v-else-if="editorType==I_EDITOR_LIST">
                <bip-list-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @focus="focus"></bip-list-editor>
            </template>
            <template v-else-if="editorType == I_EDITOR_RTEXT">
                <!-- <bip-rich-text-editor :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row"></bip-rich-text-editor> -->
                <bip-rich-text-u-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row" @focus="focus"></bip-rich-text-u-editor>
            </template>
            <template v-else-if="editorType == I_EDITOR_CHECK">
                <bip-check-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @focus="focus"></bip-check-editor>
            </template>
            <template v-else-if="editorType == I_EDITOR_RADIO">
                <bip-radio-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :bipInsAid="bipInsAid" :row="row" @focus="focus"></bip-radio-editor>
            </template>
            <template v-else-if="editorType == I_EDITOR_COLOR">
                <bip-input-color-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row" @focus="focus"></bip-input-color-editor>
            </template>
            <template v-else-if="editorType == I_EDITOR_AUTOGRAPH">
                <bip-input-autograph class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row" @focus="focus"></bip-input-autograph>
            </template>
            <template v-else-if="editorType == I_EDITOR_IMG">
                <bip-input-img-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row" @focus="focus"></bip-input-img-editor>
            </template>
            <template v-else-if="editorType == I_EDITOR_CASCADER">
                <bip-input-cascader-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row" @focus="focus"></bip-input-cascader-editor>
            </template>
            <template v-else>
                <bip-input-editor class="BJstyle" :cell="cell" :cds="cds" :model="value" :bgrid="bgrid" :row="row" @focus="focus"></bip-input-editor>
            </template>   
        </template>  
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { State, Action, Getter, Mutation } from "vuex-class";
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipCheckEditor from './BipCheckEditor.vue'
import BipRadioEditor from './BipRadioEditor.vue'
import BipInputEditor from './BipInputEditor.vue'
import BipNumberEditor from './BipNumberEditor.vue'
import BipListEditor from './BipListEditor.vue'
import BipInsAidEditor from './BipInsAidEditor.vue'
import BipDateEditor from './BipDateEditor.vue'
import BipFlowEditor from './BipFlowEditor.vue'
import BipUpDownEditor from './BipUpDownEditor.vue'
import BipQueryEditor from './BipQueryEditor.vue'
import BipRichTextEditor from './BipRichTextEditor.vue'
import BipRichTextUEditor from './BipRichTextUEditor.vue'
import BipTreeEditor from './BipTreeEditor.vue'
import BipSwitchEditor from './BipSwitchEditor.vue'
import BipInputAutograph from './BipInputAutograph.vue'
import BipInputColorEditor from './BipInputColorPickerEditor.vue'
import BipInputImgEditor from './BipInputImgEditor.vue'
import BipInputCascaderEditor from './BipInputCascaderEditor.vue'
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import { BIPUtils } from '@/utils/BaseUtil'
import BipInsAidNew from '../../classes/BipInsAidNew';
import CRecord from '../../classes/pub/CRecord';
let baseTool = BIPUtils.baseUtil
import CCliEnv from '@/classes/cenv/CCliEnv'
import { BIPUtil } from '@/utils/Request';
let tools = BIPUtil.ServApi
import QueryEntity from '../../classes/search/QueryEntity';
@Component({
    components:{BipInputEditor,BipNumberEditor,BipListEditor,BipInsAidEditor,BipDateEditor,BipFlowEditor,BipUpDownEditor,BipQueryEditor,BipRichTextEditor,BipTreeEditor,BipSwitchEditor,BipCheckEditor,BipRadioEditor,BipInputColorEditor,BipInputAutograph,BipRichTextUEditor,BipInputImgEditor,BipInputCascaderEditor}
})
export default class BipCommEditor extends Vue{
    @Prop() env!:CCliEnv
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() bgrid!:boolean
    @Prop() cdsCount!:CDataSet
    editorType:number = 0
    I_EDITOR_LIST = ICL.I_EDITOR_LIST
    I_EDITOR_RTEXT = ICL.I_EDITOR_RTEXT 
    I_EDITOR_CHECK = ICL.I_EDITOR_CHECK 
    I_EDITOR_SWITCH = ICL.I_EDITOR_SWITCH
    I_EDITOR_AUTOGRAPH = ICL.I_EDITOR_AUTOGRAPH
    I_EDITOR_NUM = ICL.I_EDITOR_NUM
    I_EDITOR_RADIO = ICL.I_EDITOR_RADIO
    I_EDITOR_COLOR = ICL.I_EDITOR_COLOR
    I_EDITOR_IMG = ICL.I_EDITOR_IMG
    I_EDITOR_CASCADER = ICL.I_EDITOR_CASCADER
    model:any = ''
    bsearch:boolean = false
    assit:boolean = false
    editName:any = ''
    aidMarkKey:string = "";
    bipInsAid:BipInsAidNew|null = null
    qe:QueryEntity = new QueryEntity("","")
    @State("aidInfos", { namespace: "insaid" }) aidInfo: any;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    eventId:number = 0
    async mounted(){
        await this.init();
    }

    beforeDestroy(){
        this.$bus.$off('cell_edit',this.eventId)
    }

    updated(){
        this.mapChanges()
    }

    @Watch('aidInfo')
    async mapChanges(){
        if(!this.bipInsAid){
            if(this.assit){
                if(this.editName){
                    let rr = this.aidInfo.get(ICL.AID_KEY+this.aidMarkKey+this.editName)
                    if(rr && rr.cells && rr.cells.cels && rr.cells.cels.length>0){
                        this.bipInsAid = rr
                    }else{
                        await this.getInsAidInfoBy(this.editName)
                    }
                }
            }else{
                if(this.editorType == this.I_EDITOR_LIST){
                    let rr = this.aidInfo.get(ICL.AID_KEYCL+this.aidMarkKey+this.editName)
                    if(rr)
                        this.bipInsAid = rr
                }
            }
        }

    }
    async init(){
        this.model = this.getModelValues();
        this.eventId = this.$bus.$on('cell_edit',this.getModelValues)
        this.bsearch = (this.cds.ccells.attr&0x80)>0
        this.assit = this.cell.assist
        this.aidMarkKey = this.cds.ccells.obj_id + "_" + this.cell.id+'_';
        if(this.assit){
            this.editName = this.cell.editName
            if(!this.inProcess.get(ICL.AID_KEY+this.aidMarkKey+this.editName)){
                await this.getInsAidInfoBy(this.editName)
            }
        }else{
            //没有辅助，但是编辑器类型是下拉列表，需要处理参照信息
            let type = this.cell.type;
            if(this.cell.editType === 1 || this.cell.editType === 5){//List
                this.editorType = this.I_EDITOR_LIST
                let str = this.cell.refValue
                if(str){
                    await this.initInsAid(str,true);
                }
            }else if(this.cell.editType == 3){//多选框
                this.editorType = this.I_EDITOR_CHECK
                let str = this.cell.refValue
                if(str){
                    await this.initInsAid(str,true);
                }
            }else if(this.cell.editType == 4){//单选框
                this.editorType = this.I_EDITOR_RADIO
                let str = this.cell.refValue
                if(str){
                    await this.initInsAid(str,true);
                }
            }else if(this.cell.editType == 6){//图片
                this.editorType = ICL.I_EDITOR_IMG;
            }else if(this.cell.editType == 13){
                this.editorType = ICL.I_EDITOR_AUTOGRAPH;
            }else if(this.cell.editType == 14){
                this.editorType = ICL.I_EDITOR_SWITCH;
            }else if(this.cell.editType == 15){
                this.editorType = ICL.I_EDITOR_COLOR;
            }else if(this.cell.editType == 10){
                this.editorType = this.I_EDITOR_RTEXT
            }else if(this.cell.editType == this.I_EDITOR_CASCADER){
                this.editorType = this.I_EDITOR_CASCADER
            }else if(type>=2&&type<12){
                let str = this.cell.refValue
                if(str){
                    await this.initInsAid(str);
                    this.editorType = this.I_EDITOR_LIST
                }else
                    this.editorType = this.I_EDITOR_NUM
            }
        }
    }
    @Watch("cell")
    async cellChange(){
        this.bipInsAid = null;
        await this.init();
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
            /**
             * 处理对象传值
             */
            if((this.cell.attr & 0x1000)<=0){
                if(script && script.indexOf("*")!=-1 && !script.startsWith("=:")){
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
        console.log("getInsAidInfoBy  : " +editName)
        let str = editName
        if(bcl){
            str = ICL.AID_KEYCL+this.aidMarkKey+str;
        }else{
            str = ICL.AID_KEY+this.aidMarkKey+str
        }
        let vv = this.aidInfo.get(str)
        if(!vv){
            vv  = window.sessionStorage.getItem(str)
            if(!vv){
                let vars = {id:bcl?300:200,aid:editName,ak:this.aidMarkKey}
                let res = await this.fetchInsAid(vars);
                if(res.data.id==0){
                    this.bipInsAid = null;
                    this.bipInsAid = res.data.data.data
                }
            }else{
                this.bipInsAid = JSON.parse(vv)
                let vals = {key:str,value:this.bipInsAid}
                this.setAidInfo(vals)
            }
        }else{
            this.bipInsAid = vv;
        }
    }
    async getInsAidInfoValues(editName:string,bcl:boolean = false,getVl:boolean =false){
        let bipInsAid = null;
        let str = editName
        if(bcl){
            str = ICL.AID_KEYCL+this.aidMarkKey+str;
        }else{
            str = ICL.AID_KEY+this.aidMarkKey+str
        }
        let vv = this.aidInfo.get(str)
        if(!vv || (vv.values && vv.values.length==0)){
            vv  = window.sessionStorage.getItem(str)
            if(vv){
                vv = JSON.parse(vv);
                bipInsAid = vv;
            }
            if(!vv || (vv.values && vv.values.length==0)){
                let vars = {id:bcl?300:200,aid:editName,ak:this.aidMarkKey}
                let res = await this.fetchInsAid(vars);
                if(res.data.id==0){
                    vv = res.data.data.data
                    bipInsAid = vv;
                }
            }
        }else{
            bipInsAid = vv;
        }
        //List  是辅助的 进行一下数据查询
        if(vv && getVl){
            this.qe.page.pageSize = 1000
            await tools.getBipInsAidInfo(editName,210,this.qe).then((res:any)=>{
                if(res.data.id==0){
                    vv.values = res.data.data.data.values;
                    bipInsAid = vv;
                }
            }).catch((err:any)=>{
                this.$notify.error(err+";BipCommEditor getInsAidInfoValues")
            });
        }
        this.bipInsAid = bipInsAid;
    }

    async initInsAid(str:any,getVl:boolean=false){
        if(str){
            if(str.indexOf('$')>0){
                str = str.substr(str.indexOf('$')+1,-str.indexOf('$')+str.indexOf("}")-1);
                this.editName = str
                await this.getInsAidInfoBy(str,true)
            }else if(str.indexOf('&')>0){
                str = str.substr(str.indexOf('&')+1,-str.indexOf('&')+str.indexOf("}")-1);
                this.editName = str
                await this.getInsAidInfoValues(str,false,getVl)
            }else{
                this.bipInsAid = baseTool.makeBipInsAidByStr(str,this.cell.id)
            }
        }
    }
                            
    @Watch('model')
    modelChange(){
        this.$bus.$emit('datachange','')
        if(this.cds.currRecord && this.cds.index == this.row){
            if(this.cds.currRecord.data[this.cell.id] != this.model){
                this.cds.currRecord.data[this.cell.id] = this.model
                this.cds.cdata.data[this.row] = this.cds.currRecord
            }
        }
    }

    //刷新辅助缓存
    async refInsAid(){
        if(this.bipInsAid){
            let vars = {id:this.bipInsAid.cl?300:200,aid:this.editName,ak:this.aidMarkKey}
            let res = await this.fetchInsAid(vars);
            if(res.data.id==0){
                this.bipInsAid = null;
                this.bipInsAid = res.data.data.data
            }
            if(this.bipInsAid){
                let dia: any = this.$refs[this.cell.id+'insaid'];
                if (dia) dia.openRefDl();
            }
        }

    }
    focus(res:any){
        res["rowId"] = this.row;
        this.$emit("focus",res)
    }

    /**
     * 是否是其他格式日期
     */
    get isOtherDate(){
        return (this.editName === 'Y' || this.editName === 'M' || this.editName === 'DATE_WEEK')
    }
}
</script>
<style>
 .BJstyle{
    padding: 0 5px 0 0;
    height: auto !important;
 }
</style>
