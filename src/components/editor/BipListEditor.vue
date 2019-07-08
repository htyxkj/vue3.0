<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <el-form-item :label="cell.labelString" :required="cell.isReq">
            <el-select v-model="model1" :multiple="multiple" collapse-tags placeholder="请选择" size="small" style="width:100%" :disabled="(cell.attr&0x40)>0" clearable  @change="dataChange">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL

import { State, Action, Getter, Mutation } from "vuex-class";
import { AssistState } from "@/store/modules/assist/types";
@Component({})
export default class BipListEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model?:any
    @Provide() model1:any = ""
    @Provide() clearable:boolean = true
    @Provide() bcl:boolean = false
    @Provide() multiple:boolean = false
    @Provide() options:any = []
    @Provide() refId:string = ''
    @Provide() initOK:boolean = false
    @Provide() span:number = 6
    @Getter("KEY_MAPS", { namespace: "assit" }) keyMaps: any;
    @Getter("CL_INFOS", { namespace: "assit" }) clMap: any;

    @Mutation("setCLInfo", { namespace: "assit" }) setCLInfo: any;
    @Action("fetchCLById", { namespace: "assit" }) fetchCLById: any;

    @Provide() methodName:string = ''

    //[{value:'A',label:'A类型'},{value:'B',label:'B类型'},{value:'C',label:'C类型'}]
    mounted(){
        // if(this.cds){
        this.multiple = (this.cds.ccells.attr&0x80)>0
        // }
        this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        if(this.multiple){
            this.model1 = []

        }else{
            this.model1 = this.model
        }
        // if(this.cds&&this.cell){
            this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id
            let str = this.cell.refValue;
            console.log(str)
            if(str.startsWith('{')){
                str = str.substring(1,str.length-1)
                if(str.startsWith('$')){
                    str = str.substring(1)
                    this.bcl = true
                }
            }
            this.refId = str
            if(!(this.cell.isReq || this.cell.unNull)){
                if(!this.multiple)
                this.options.push({value:'',label:''})
            }
            if(this.bcl){
                //list是常量
                let vv = this.getCLInfo(this.refId)
                if(vv){
                    let labes:Array<string> = vv.labers
                    let vals:Array<any> = vv.values
                    if(vals&&vals.length>0){
                        vals.forEach(item=>{
                            let n2 = {value:item[labes[0]]+'',label:item[labes[1]||labes[0]]}
                            this.options.push(n2)
                        })
                    }
                    this.initOK = true
                }else{
                    if(!this.keyMaps.get(this.refId)){
                        this.initOK = false
                        this.fetchCLById(this.refId)
                    }
                }
            }else{
                let vns:Array<string> = str.split(';')
                vns.forEach(item => {
                    let n1 = item.split(':')
                    let n2 = {value:n1[0],label:n1[1]?n1[1]:n1[0]}
                    this.options.push(n2)
                });
                this.initOK = true
            }
        // }
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

    dataChange(value:any){
        if(this.cds&&this.cell){
            // let nn = this.cds.currRecord[this.cell.id]
            let str = ""
            if(this.multiple){
                this.model1 = []
                value.forEach((item:string)=>{
                    if(item!==''){
                        str+=item+';'
                        this.model1.push(item)
                    }       
                })
                str = str.substring(0,str.length-1)
            }else{
                str = this.model1
            }
            if( str !== this.model){
                if(this.cds.currCanEdit()){
                    this.cds.setStateOrAnd(icl.R_EDITED)
                    let record = this.cds.currRecord
                    record[this.cell.id] = str
                    this.cds.currRecord = Object.assign({},record);
                    this.cds.cdata._data[this.cds.index] = Object.assign({},record)
                    const key:string = this.cell.id
                    this.$bus.$emit(this.methodName,{cellId:key,value:this.model1,row:this.cds.index})
                    this.cds.cellChange(key,str);
                }else{
                    this.model1 = this.model
                }   
            }
        }   
    }

    @Watch("clMap",{deep:true})
    clMapChange(){
        console.log('clMap change')
        if(this.bcl){
            let vv = this.clMap.get('CL_'+this.refId)
            if(vv!=null&&vv&&vv.values){
                if(this.options.length<vv.values.length){
                    this.options = []
                    if(this.cell){
                        if(!(this.cell.isReq || this.cell.unNull)){
                            this.options.push({value:'',label:''})
                        }
                    }
                    let labes:Array<string> = vv.labers
                    let vals:Array<any> = vv.values
                    if(vals&&vals.length>0){
                        vals.forEach(item=>{
                            let n2 = {value:item[labes[0]]+'',label:item[labes[1]||labes[0]]}
                            this.options.push(n2)
                        })
                    }
                    this.initOK = true;
                }
            }
        }
    }

    @Watch('model')
    valueChange(){
        console.log(this.model)
        if(this.multiple){
            let str = this.model||''
            if(str.length>0){
                this.model1 = str.split(';')
            }
        }else{
            if(this.model!=this.model1){
                this.model1 = this.model
            }
        }

    }
}
</script>


