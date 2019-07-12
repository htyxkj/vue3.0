<template>
    <div v-if="laycell" class="bip-lay">
        <template v-if="laycell&&!laycell.btable">
            <bip-comm-editor  v-for="(cel,index) in laycell.uiCels" :key="index" :cell="cel" :cds="cds"/>
        </template>
        <template v-else>
            <lay-cell-vex-table :laycell="laycell" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></lay-cell-vex-table>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipLayCells from '@/classes/ui/BipLayCells';
import {Cell} from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import BipCommEditor from '../editor/BipCommEditor.vue'
// import BipGridLay from '../grideditor/BipGridLay.vue'
import LayCellVexTable from './LayCellVexTable.vue'
import LayCellEtable from './LayCellEtable.vue'
@Component({
    components:{BipCommEditor,LayCellEtable,LayCellVexTable}
})
export default class LayCell extends Vue{
    @Prop() laycell!:BipLayCells
    @Prop() env!:CCliEnv
    @Provide() info:string = 'infos'
    @Provide() clearable:boolean = true

    @Provide() cds:CDataSet = new CDataSet(null)
    @Provide() widths:Array<string> = new Array<string>()
    @Provide() beBill:boolean = true

    created(){
        this.initWidth();
        this.cds = this.env.getDataSet(this.laycell.obj_id);
        this.beBill = this.env.uriParams.beBill
    }

    addRecord(){
        this.cds.createRecord()
    }

    initWidth(){
        if(this.laycell){         
            this.laycell.uiCels.forEach(cel => {
                if(cel.isShow){
                    let w1 = cel.ccCharleng;
                    if(!cel.id.startsWith('cid')){
                        w1 = w1<10?8:w1
                    }
                    let w = w1*9+20;
                    if(w>200)
                        w = 200
                    this.widths.push(w+'')
                }
            });          
        }
    }

    getNumChar(cell:any):number{
        let cn = cell.ccCharleng
        return cn
    }


    handleSizeChange(value:number){
        console.log('handleSizeChange',value)
        this.$emit('handleSizeChange',value)
    }

    handleCurrentChange(value:number){
        console.log('handleCurrentChange',value)
        this.$emit('handleCurrentChange',value)
    }

}
</script>

<style lang="scss">
.bip-lay{
    width: 100%;
    max-width: 100%;
    .el-form-item__content{
        line-height: 0px !important
    }
}
.bip-number{
    color: rgb(54, 180, 121)
}
.bip-req{
    color: rgb(167, 8, 8)
}
</style>

