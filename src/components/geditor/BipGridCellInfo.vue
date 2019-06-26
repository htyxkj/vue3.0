<template>
    <div class="bip-show">
        <template v-if="cell.editType === 1">
            <bip-list-ref :cds="cds" :cell="cell" :index="index" :model="model"></bip-list-ref>
        </template>
        <template v-else-if="cell.editType!== 1&&cell.refValue">
            <bip-aid-ref :cds="cds" :cell="cell" :index="index" :model="model"></bip-aid-ref>
        </template>
        <template v-else>
            <bip-grid-show :cds="cds" :cell="cell" :index="index" :model="model"></bip-grid-show>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';

import BipListRef from './ref/BipListRef.vue'
import BipAidRef from './ref/BipAidRef.vue'
import BipGridShow from './BipGridShow.vue'
import {CommICL} from '@/utils/CommICL'
const icl = CommICL
@Component({components:{BipAidRef,BipListRef,BipGridShow}})
export default class BipGridCellInfo extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() index!:number
    @Provide() eventId:number = 0
    @Provide() model:string = ''
    @Provide() methodName:string = ''
     mounted(){
        this.model = this.getValue()
        // console.log(this.model,'开始订阅')
        this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id
        if(this.eventId==0)
            this.eventId = this.$bus.$on(this.methodName,this.cellEditChange)
         
    }

    updated(){
        this.model = this.getValue()
    
    }

    beforeDestroy(){
        if(this.methodName)
            this.$bus.$off(this.methodName,this.eventId)
    }

    cellEditChange(param:any){
        
        if(this.cell.id == param.cellId &&param.row==this.index&&this.model!=param.value){
            console.log('11111',param,this.model)
            this.model = param.value+''
            return 
        }
        return 
    }

    

    getValue(){
        if(this.cds&&this.cell){
            const i = this.index?this.index:0
            return this.cds.getRecordAtIndex(i)[this.cell.id]||''
        }
        return '';
    }
}
</script>
<style lang="scss">
.bip-show{
    width: 100%;
    padding: 0 0;
}
</style>


