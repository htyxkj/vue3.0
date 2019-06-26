<template>
    <div class="bip-grid-cell">
        <el-input ref="input"
            placeholder=""
            v-model="model1"
            size="small" type="number" @change="dataChange" @blur="finished" min="0" :autofocus="true">
        </el-input>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
@Component({})
export default class BipGridNumberEditor extends Vue{
    @Prop() cds?:CDataSet
    @Prop() cell?:Cell
    @Prop() index?:number
    @Prop() model?:string
    @Provide() model1:string=''
    mounted(){
        let _i = this.index?this.index:0
        if(this.cds&&this.cell){
            // let record:any = this.cds.cdata._data[_i];
            this.model1 = this.model?this.model:''
        }
        let input:any = this.$refs['input']
        input.focus() 
    }

    dataChange(value:any){
        let _i = this.index?this.index:0
        if(this.cds&&this.cell){
            let record:any = this.cds.cdata._data[_i];
            record[this.cell.id] = value
            record.sys_stated = record.sys_stated|2
            console.log(this.cds.ds_par)
            if(this.cds.ds_par){
                this.cds.ds_par.setStateOrAnd(2)
            }
        }
        console.log('over')
        this.$emit('finished')
    }

    finished(){
        console.log('over')
        this.$emit('finished')
        
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
