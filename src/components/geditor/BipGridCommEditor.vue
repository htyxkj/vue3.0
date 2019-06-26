<template>
    <div class="bip-grid-cell">
        <el-input
            placeholder=""
            v-model="model1"
            size="small" @change="dataChange">
        </el-input>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
@Component({})
export default class BipGridCommEditor extends Vue{
    @Prop() cds?:CDataSet
    @Prop() cell?:Cell
    @Prop() index?:number
    @Prop() model?:string
    @Provide() model1:string=''
    @Provide() eventId:number = 0
    mounted(){
        this.model1 = this.model||''
        // this.eventId = this.$bus.$on('cellDataChange',this.cellEditChange)
        // let _i = this.index?this.index:0
        // if(this.cds&&this.cell){
        //     this.model1 = this.model?this.model:''
        // }   
    }

    beforeDestroy(){
        // this.$bus.$off('cellDataChange',this.eventId)
    }

    cellEditChange(param:any){
        // {cellId:key,value:this.model1}
        console.log(param);
    }
    dataChange(value:any){
        let _i = this.index?this.index:0
        if(this.cds&&this.cell){
            //TODO 判断一下能否编辑
            let record:any = this.cds.cdata._data[_i];
            record[this.cell.id] = value
            record.sys_stated = record.sys_stated|2
            this.cds.currRecord = Object.assign({},record);
            this.cds.cdata._data[_i] = Object.assign({},record)
            this.cds.cellChange(this.cell.id,value)
        }
    }



    @Watch('model')
    valueChange(){
        this.model1 = this.model||''
    }
}
</script>
<style lang="scss">
.bip-grid-cell{
    .el-input__inner:focus{
        border: 1px solid #ccceee !important;
        padding: 0 1px;
        text-align: center;
        background-color:yellow;
    }
    .el-input__inner{
        border: 0px !important;
        padding: 0 1px;
        text-align: center;
    }
}
</style>
