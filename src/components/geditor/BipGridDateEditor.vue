<template>
    <el-date-picker size="small" style="width:100%"
    v-model="model1"
    :type="dateType"
    :format="dateFormat"
    :value-format="dateFormat"
    placeholder=""  @change="dataChange">
    </el-date-picker>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
@Component({})
export default class BipGridNumberEditor extends Vue{
    @Prop() cds?:CDataSet
    @Prop() cell?:Cell
    @Prop() index?:number
    @Prop() model?:string
    @Provide() model1:string=''
    @Provide() dateType:string = 'date'
    @Provide() dateFormat:string='yyyy-MM-dd'
    mounted(){
        if(this.cds&&this.cell){
            console.log('mounted',this.model,this.cell)
            this.model1 = this.model||''
            if(this.model1=="Invalid date"){
                this.model1 = ''
            }
            if(this.cell.type===93){
                this.dateType = 'datetime'
                this.dateFormat = 'yyyy-MM-dd HH:mm:ss'
            }
        }
    }

    dataChange(value:any){
        console.log('dataChange',value)
        let _i = this.index?this.index:0
        if(value){
            // value = baseTool.dateFormat(value,this.cell?this.cell.type:91,null)
        }else{
            value = ''
        }

        if(value == 'Invalid date'){
            value = ''
        }
        console.log(value)
        if(this.cds&&this.cell){
            let record:any = this.cds.cdata._data[_i];
            record[this.cell.id] = value
            record.sys_stated = record.sys_stated|2
            this.cds.currRecord = Object.assign({},record);
            this.cds.cdata._data[_i] = Object.assign({},record)
        }
    }
}
</script>

