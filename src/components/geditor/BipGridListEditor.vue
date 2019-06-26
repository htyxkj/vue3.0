<template>
    <el-select v-model="model1" placeholder="请选择" size="small" style="width:100%"  @change="dataChange" >
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
        </el-option>
    </el-select>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';

import { State, Action, Getter, Mutation } from "vuex-class";
import { AssistState } from "@/store/modules/assist/types";

@Component({})
export default class BipGridListEditor extends Vue{
    @Prop() cds?:CDataSet
    @Prop() cell?:Cell
    @Prop() index?:number
    @Prop() model?:string
    @Provide() model1:any = ''
    @Provide() clearable:boolean = true
    @Provide() options:any = []
    @Provide() bcl:boolean = false
    @Provide() refId:string = ''
    @Provide() initOK:boolean = false
    @Getter("KEY_MAPS", { namespace: "assit" }) keyMaps: any;
    @Getter("CL_INFOS", { namespace: "assit" }) clMap: any;
    @Mutation("setCLInfo", { namespace: "assit" }) setCLInfo: any;
    @Action("fetchCLById", { namespace: "assit" }) fetchCLById: any;

    //[{value:'A',label:'A类型'},{value:'B',label:'B类型'},{value:'C',label:'C类型'}]
    async mounted(){
        let _i = this.index?this.index:0
        if(this.cds&&this.cell){
            // let record:any = this.cds.cdata._data[_i]
            this.model1 = this.model
            let str = this.cell.refValue;
            //{$CL.NOYES}
            console.log(str,this.cell)
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

    finish(bs:boolean){
        if(!bs){
            this.$emit('finished')
        }
    }

    dataChange(value:any){
        if(this.cds&&this.cell){
            if( this.model !== this.model1){
                if(this.cds.currCanEdit(this.index)){
                   let crd =  this.cds.getRecordAtIndex(this.index);
                   crd[this.cell.id] = this.model1;
                   crd.sys_stated = crd.sys_stated|2
                    this.cds.currRecord = Object.assign({},crd);
                    this.cds.cdata._data[this.cds.index] = Object.assign({},crd)
                    this.cds.cellChange(this.cell.id,this.model1)
                }else{
                    this.model1 = this.model
                }   
            }
        }   
    }
}
</script>

<style lang="css">
</style>

