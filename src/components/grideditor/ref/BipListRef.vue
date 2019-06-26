<template>
    <div class="bip-ref">
        <span>{{showValues}}</span>
        <div class="bip-ref-icon"><i class="el-icon-arrow-down"></i></div>
    </div>
    
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { BIPUtil } from '@/utils/Request';

import { State, Action, Getter, Mutation } from "vuex-class";
import { AssistState } from "@/store/modules/assist/types";
@Component({})
export default class BipListRef extends Vue{
    @Prop() cds?:CDataSet
    @Prop() cell?:Cell
    @Prop() index?:number
    @Prop() model?:string
    @Provide() model1:any = ''
    @Provide() showValues:any = ''
    @Provide() options:any = []

    @Provide() refId:string = ''
    @Provide() initOK:boolean = false
    @Provide() bcl:boolean = false
    @Getter("KEY_MAPS", { namespace: "assit" }) keyMaps: any;
    @Getter("CL_INFOS", { namespace: "assit" }) clMap: any;

    @Mutation("setCLInfo", { namespace: "assit" }) setCLInfo: any;
    @Action("fetchCLById", { namespace: "assit" }) fetchCLById: any;
    mounted(){
        this.model1 = this.model||''
        this.showValues = this.model1
        if(this.cds&&this.cell){
            let str = this.cell.refValue;
            if(str.startsWith('{')){
                str = str.substring(1,str.length-1)
                if(str.startsWith('$')){
                    str = str.substring(1)
                    this.bcl = true
                }
            }
            this.refId = str
            if(!(this.cell.isReq || this.cell.unNull)){
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
                    this.makeShowValue()
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
                this.makeShowValue()
            }
        }
    }

    @Watch("clMap")
    clMapChange(){
        if(this.bcl&&!this.initOK){
            let vv = this.clMap.get('CL_'+this.refId)
            if(vv&&vv.values){
                if(this.options.length<vv.values){
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
                        this.makeShowValue()
                    }
                }
            }
        }
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

    @Watch('model')
    dataChange(value:any){
        let _i = this.index?this.index:0
        if(this.cds&&this.cell){
            let record:any = this.cds.cdata._data[_i]
            let nn = record[this.cell.id]
            if( this.model1 !== this.model){
                this.model1 = this.model;
                this.makeShowValue()
            }
        } 
    }

    


    makeShowValue(){
        if(this.options){
            let vars:Array<any> = this.options
            vars.forEach(item => {
                if(item.value == this.model1)
                    this.showValues = item.label
            });
        } 
    }
}
</script>

<style lang="scss">
.bip-ref{
    width: 100%;
    min-height: 23px;
    .bip-ref-icon{
        float: right;
        margin-right: 10px;
    }
}
</style>

