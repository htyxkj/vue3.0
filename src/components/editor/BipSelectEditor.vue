<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
            <el-input
                v-model="model1"
                size="small"
                :clearable="clearable"
                :disabled="disabled"
                @change="dataChange"
                @focus="getFocus(true)"
                @blur="getFocus(false)"
            >
                <i
                    slot="suffix"
                    class="el-input__icon el-icon-search"
                    @click="iconClick()"
                    :disabled="disabled>0"
                ></i>
            </el-input>
        </el-form-item>
        <template v-if="dia">
            <bip-assist-editor
                :aId="cell.editName"
                :multiple="multiple"
                ref="ak"
                @select="selectCallBack"
            ></bip-assist-editor>
        </template>
    </el-col>
</template>
<script lang="ts">
//辅助query
import {
    Component,
    Vue,
    Provide,
    Prop,
    Watch
} from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import { Cell } from "@/classes/pub/coob/Cell";
import BipAssistEditor from "./BipAssistEditor.vue";
import AIdAssist from "@/classes/AIdAssist";
import LinkRef from "@/classes/LinkRef";
import { CommICL } from "@/utils/CommICL";
let icl = CommICL;

import { State, Action, Getter, Mutation } from "vuex-class";
import { AssistState } from "@/store/modules/assist/types";
@Component({
    components: { BipAssistEditor }
})
export default class BipSelectEditor extends Vue {
    @Prop() cds!: CDataSet;
    @Prop() cell!: Cell;
    @Prop() model?: any;
    @Provide() model1: any = "";
    @Provide() clearable: boolean = false;
    @Provide() disabled: boolean = true;
    @Provide() dia: boolean = false;
    @Provide() multiple: boolean = false;
    @Provide() selectedValues: any;

    @Provide() cont: string = "";
    @Provide() mulcols: boolean = false;
    @Provide() aidInfo: AIdAssist = new AIdAssist(""); //辅助对象
    @Provide() linkRef: LinkRef = new LinkRef(""); //辅助对象
    @Provide() othCols: Array<string> = [];
    @Provide() othColsIndex: Array<number> = [];
    @Provide() bfmt: boolean = false;
    @Provide() bcode: boolean = false;
    @Provide() span:number = 6


    @Provide() assistId: string = ""; //辅助ID
    @Provide() refId: string = ""; //参照ID
    @Provide() refBcl: boolean = false; //参照是否是常量
    @Getter("AID_INFOS", { namespace: "assit" }) aidMap: any;
    @Getter("KEY_MAPS", { namespace: "assit" }) keyMaps: any;
    @Getter("AID_VALUES", { namespace: "assit" }) aidValues: any;
    @Getter("CL_INFOS", { namespace: "assit" }) clMap: any;
    @Mutation("setAidInfo", { namespace: "assit" }) setAidInfo: any;
    @Mutation("setCLInfo", { namespace: "assit" }) setCLInfo: any;
    @Mutation("setAidValue", { namespace: "assit" }) setAidValue: any;
    @Action("fetchAssist", { namespace: "assit" }) fetchAssist: any;
    @Action("fetchCLById", { namespace: "assit" }) fetchCLById: any;
    @Action("fetchRefById", { namespace: "assit" }) fetchRefById: any;
    mounted() {
        // if (this.cds && this.cell) {
            this.assistId = this.cell.editName;
            this.model1 = this.model+'';
            this.disabled = (this.cell.attr & 0x40) > 0;
            this.multiple = (this.cell.attr & 0x200000) > 0;
            this.mulcols = (this.cell.attr & 0x100000) > 0;
            this.bfmt = (this.cell.attr & 0x10000) > 0;
            this.bcode = (this.cell.attr & 0x40000) > 0;
            if (!this.cell.refValue) {
                this.bcode = true;
            } else {
                this.bcode = (this.cell.attr & 0x40000) > 0;
            }
            if (this.mulcols) {
                this.initMulColInfo();
            }
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
            let str = this.cell.refValue || this.cell.editName;
            if (str) {
                let refId1 = str.startsWith("{")
                    ? str.substring(1, str.length - 1)
                    : str;
                this.refBcl = refId1.startsWith("$");
                if (refId1.startsWith("$") || refId1.startsWith("&"))
                    refId1 = refId1.substring(1);
                this.refId = refId1;
            }
            this.linkRef = new LinkRef(this.refId, this.refBcl, this.multiple);
            this.initAssist();
            // this.initRef();
        // }
    }

    //#region 初始化辅助和参照
    /**
     * 初始化辅助
     */
    initAssist() {
        // if (this.cell) {
            let str = this.cell.editName;
            console.log(str)
            let mp: Map<string, boolean> = this.keyMaps;
            let bexit = mp.get(str);
            console.log(bexit)
            if (!bexit) {
                let aidii = this.getAidInfos(str);
                if (!aidii) {
                    this.fetchAssist({ id: str, value: this.model1 })
                        .then((res: any) => {
                            if (res && res.data.id === 0) {
                                this.aidInfo = this.aidMap.get(this.assistId);
                                this.aidInfo.initOK = true;
                                this.initlinkRef()
                            } else {
                                this.$notify.error(res.message);
                            }
                        })
                        .catch((err: any) => {
                            // console.log(err)
                            this.$notify.error(`获取辅助失败:【${str}】` + err);
                        });
                } else {
                    this.aidInfo = aidii;
                    this.aidInfo['initOK'] = true;
                    this.initlinkRef()
                }
            }else{
                let aidii:any = this.getAidInfos(str);
                if(aidii){
                    console.log(aidii)
                    aidii.initOK = true
                    this.aidInfo = aidii;
                    this.initlinkRef()
                }
            }
    }

    /**初始化多列参照 */
    initMulColInfo() {
        let script = this.cell ? this.cell.script : "";
        if (script) {
            let vals = script.split("&");
            if (vals.length < 2) {
                this.$notify.error("多列定义错误" + script);
            } else {
                let flds = vals[0].split(",");
                let flds_index: Array<number> = vals[1]
                    .split(",")
                    .map(value => {
                        return parseInt(value);
                    });
                if (flds.length != flds_index.length) {
                    this.$notify.error(
                        "多列参照定义的字段和下标的个数不对" + script
                    );
                } else {
                    this.othCols = flds;
                    this.othColsIndex = flds_index;
                }
            }
        }
    }
    //#endregion

    /***
     * 获取或者失去焦点事件
     * 给输入框赋值
     * 获取焦点显示的是实际的值
     * 失去焦点，显示的是参照值
     */
    getFocus(gets: boolean) {
        if (gets) {
            if (this.cds && this.cell) {
                if (this.linkRef && this.linkRef.realV) {
                    this.model1 = this.linkRef.realV;
                } else {
                    this.model1 = this.model;
                }
            }
        } else {
            if (this.linkRef && this.linkRef.showV) {
                if (this.bcode) {
                    this.model1 = this.linkRef.realV;
                } else this.model1 = this.linkRef.showV;
            } else {
                if (this.cds && this.cell) this.model1 = this.model;
            }
        }
    }

    /***
     * 数据改变事件
     */
    dataChange(value: string | number) {
        if (this.cds && this.cell) {
            if (this.cds.currCanEdit()) {
                if (this.model1 !== this.model) {
                    this.cds.currRecord[this.cell.id] = this.model1;
                    if (!this.model1) {
                        this.linkRef.realV = "";
                        this.linkRef.showV = "";
                    }
                }
            } else {
                this.model1 = this.model;
            }
        }
    }

    /**
     * 点击弹出辅助选择框
     *  */
    iconClick() {
        if (!this.disabled) {
            this.dia = true;
            setTimeout(() => {
                let dia: any = this.$refs.ak;
                if (dia) dia.open();
            }, 100);
        }
    }

    //选择回调
    selectCallBack(value: any) {
        if (value == null) {
            return;
        }
        this.dia = false;
        if (this.cds && this.cell) {
            let record: any = this.cds.currRecord;
            this.cds.setStateOrAnd(icl.R_EDITED);
            let cel = this.cell;
            let moo = "";
            if (this.multiple) {
                let vvs: Array<any> = value;
                vvs.forEach(item => {
                    moo += value[this.aidInfo.layCells[0].id] + ";";
                });
                moo = moo.substring(0, moo.length - 1);
            } else {
                moo = value[this.aidInfo.layCells[0].id];
            }
            this.model1 = moo;
            record[cel.id] = this.model1;
            record.sys_stated = record.sys_stated|2
            this.aidInfo.values = value;
            this.linkRef.realV = this.model1;
            if (!this.linkRef.ISCL()) {
                this.linkRef.values = value;
                let k1 = this.refId+'_'+this.model1;
                if(!this.getAidValues(k1))
                    this.setAidValue({key:k1,value:value})
            }
            
            this.linkRef.makeShow();
            console.log(this.linkRef.showV)
            this.model1 = this.linkRef.showV;
            if (this.mulcols) {
                let item = value;
                if (value instanceof Array) {
                    item = value[value.length - 1];
                } else {
                    item = value;
                }
                this.othCols.forEach((fld, index) => {
                    let idx = this.othColsIndex[index];
                    let layC = this.aidInfo.layCells[idx];
                    if (layC) record[fld] = item[layC.id];
                });
            }
        }
        this.linkRef.makeShow()
    }

    getAidInfos(key: string) {
        let res = this.aidMap.get(key);
        // console.log(res, "321321321");
        if (!res) {
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            this.setAidInfo({ key: key, value: res });
        }
        return res;
    }

    getAidValues(key:string){
        let res = this.aidValues.get(key)
        // console.log(res,'getAidValues')
        if(!res){
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            this.setAidInfo({ key: key, value: res });
        }
        return res
    }

    getCLInfo(key: string) {
        key = 'CL_'+key
        let res = this.clMap.get(key);
        if (!res) {
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            if(!res)
                this.setCLInfo({ key: key, value: res });
        }
        return res;
    }

    @Watch("aidValues")
    somChange() {
        if(!this.refBcl){
            if(this.model){
                let key = this.refId+'_'+this.model
                let r = this.getAidValues(key);
                if(r&&r !== this.linkRef.values){
                    this.linkRef.values = r;
                    this.linkRef.makeShow();
                    this.getFocus(false)
                }
            }
        }
        // console.log("aidValues change");
    }

    @Watch("clMap")
    clMapChange(){
        if(this.refBcl&&!this.linkRef.initOK){
            this.initlinkRef()
        }
    }

    @Watch("aidMap")
    aidMapChange(){
        if(!this.aidInfo){
            this.aidInfo = this.aidMap.get(this.assistId);
        }else{
            if(!this.aidInfo.initOK){
                this.aidInfo = this.aidMap.get(this.assistId)
                if(this.aidInfo){
                    this.aidInfo.initOK = true
                    this.initlinkRef()
                }
            }
        }

        if(!this.linkRef.initOK&&(this.assistId !== this.refId)){
            if(this.refBcl){
                //常量
                let r:any = this.getCLInfo(this.refId);
                if(r){
                    this.linkRef.layCells = r.layCells
                    this.linkRef.title = r.title
                    this.linkRef.values = r.values
                    this.linkRef.initOK = true
                }else{
                    this.fetchCLById(this.refId);
                }
            }else{
                let aidnn = this.aidMap.get(this.refId)
                if(aidnn){
                    this.linkRef.layCells = aidnn.layCells;
                    this.linkRef.title = aidnn.title;
                    this.linkRef.initOK = true;
                }
            }

        }
    }

    initlinkRef(){
        if (this.assistId === this.refId) {
            this.linkRef.layCells = this.aidInfo.layCells;
            this.linkRef.title = this.aidInfo.title;
            this.linkRef.initOK = true;
        } else {
            if(!this.refBcl){
                let nn = this.keyMaps.get(this.refId)
                if(!nn)
                    this.fetchAssist({ id: this.refId, value: this.model1 })
            }else{
                let r:any = this.getCLInfo(this.refId);
                if(r){
                    if(!this.linkRef.initOK){
                        this.linkRef.layCells = r.layCells
                        this.linkRef.title = r.title
                        this.linkRef.initOK = true
                        this.linkRef.values = r.values
                    }
                }else{
                    if(!this.keyMaps.get(this.refId))
                        this.fetchCLById(this.refId)
                }
                
            }
        }
        this.getFocus(false)
    }

    @Watch("model", { deep: true })
    cdataSetRecordChange() {
        if (this.cds && this.cell) {
            let nn = this.model+'';
            if (this.linkRef.initOK) {
                //   console.log('linkref',this.linkRef)
                if (this.linkRef.realV != nn) {
                    this.linkRef.realV = nn;
                    this.linkRef.showV = nn;
                    if(this.refBcl){
                        this.linkRef.makeShow()
                    }else{
                        //辅助
                        nn = nn?nn+'':''
                        if(nn.length>0){
                            let aidv = this.getAidValues(this.refId+'_'+nn)
                            console.log('从')
                            if(!aidv){
                                if(!this.keyMaps.get(this.refId+"_"+nn)){   
                                    this.fetchRefById({key:this.refId,model:nn,cont:this.linkRef.makeSearchCont()})
                                }
                            }else{
                                this.linkRef.values = aidv
                                this.linkRef.makeShow();
                            }
                        }
                    }
                }
                if (this.bcode) {
                    this.model1 = this.linkRef.realV;
                    return;
                }
                if (this.bfmt) {
                    this.model1 = this.model1
                        ? this.linkRef.realV + ":" + this.linkRef.showV
                        : this.linkRef.realV;
                    return;
                }
                this.model1 = this.linkRef.showV;
            } else {
                if (this.aidInfo && this.aidInfo.realV == nn) {
                    this.model1 = this.aidInfo.showValues;
                } else {
                    //   console.log("realV != nn", nn, this.cell.id);
                    if (nn !== this.model1) {
                        this.model1 = nn;
                    }
                }
            }
        }
    }
}
</script>
