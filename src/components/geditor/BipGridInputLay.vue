<template>
    <div>
        <template v-if="cell.editType === 1">
            <bip-grid-list-editor :cds="cds" :cell="cell" :index="index" :model="value"></bip-grid-list-editor>
        </template>
        <template v-else>
            <template v-if="(cell.attr&0x40)>0">
                <bip-grid-show :cds="cds" :cell="cell" :index="index" :model="value"></bip-grid-show>
            </template>
            <template v-else-if="cell.type == 91 || cell.type==93 || cell.assType=='C_DATE'|| cell.assType=='DATE'">
                <bip-grid-date-editor :cds="cds" :cell="cell" :index="index" :model="value"></bip-grid-date-editor>
            </template>
            <template v-else-if="cell.type == 3">
                <bip-grid-number-editor :cds="cds" :cell="cell" :index="index" :model="value"></bip-grid-number-editor>
            </template>
            <template v-else-if="cell.assist&&cell.editName!='COPY'">
                <bip-grid-aid-editor :cds="cds" :cell="cell" :index="index" :model="value"></bip-grid-aid-editor>
            </template>
            <template v-else>
                <bip-grid-comm-editor :cds="cds" :cell="cell" :index="index" :model="value"></bip-grid-comm-editor>
            </template>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipGridCommEditor from './BipGridCommEditor.vue'
import BipGridListEditor from './BipGridListEditor.vue'
import BipGridDateEditor from './BipGridDateEditor.vue'
import BipGridNumberEditor from './BipGridNumberEditor.vue'
import BipListRef from './ref/BipListRef.vue'
import BipAidRef from './ref/BipAidRef.vue'
import BipGridShow from './BipGridShow.vue'
import BipGridAidEditor from './BipGridAidEditor.vue'
@Component({
    components:{BipGridCommEditor,BipGridListEditor,BipGridDateEditor,BipGridShow,BipGridNumberEditor
    ,BipListRef,BipGridAidEditor,BipAidRef}
})
export default class BipGridInputLay extends Vue{
    @Prop() cds?:CDataSet
    @Prop() cell?:Cell
    @Prop() bill?:boolean
    @Prop() index?:number

    get value(){
        if(this.cds&&this.cell){
            const i = this.index?this.index:0
            return this.cds.getRecordAtIndex(i)[this.cell.id]||''
        }
        return '';
    }
}
</script>
