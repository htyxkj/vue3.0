<template>
    <div @click="onClick" style="width:100%;min-height:23px;text-align: center">
        <template v-if="status=='editor'">
            <template v-if="cell.editType === 1">
                <bip-grid-list-editor :cds="cds" :cell="cell" :index="index" @finished="finished" :model="model"></bip-grid-list-editor>
            </template>
            <template v-else>
                <template v-if="(cell.attr&0x40)>0">
                    <bip-grid-show :cds="cds" :cell="cell" :index="index" :model="model"></bip-grid-show>
                </template>
                <template v-else-if="cell.type == 91 || cell.type==93 || cell.assType=='C_DATE'">
                    <bip-grid-date-editor :cds="cds" :cell="cell" :index="index" @finished="finished" :model="model"></bip-grid-date-editor>
                </template>
                <template v-else-if="cell.type == 3">
                    <bip-grid-number-editor :cds="cds" :cell="cell" :index="index" @finished="finished" :model="model"></bip-grid-number-editor>
                </template>
                <template v-else-if="cell.assist&&cell.editName!='COPY'">
                    <bip-grid-aid-editor :cds="cds" :cell="cell" :index="index" @finished="finished" :model="model"></bip-grid-aid-editor>
                </template>
                <template v-else>
                    <bip-grid-comm-editor :cds="cds" :cell="cell" :index="index" @finished="finished" :model="model"></bip-grid-comm-editor>
                </template>
            </template>
        </template>
        <template v-else>
            <template v-if="cell.editType === 1">
                <bip-list-ref :cds="cds" :cell="cell" :index="index" :model="model"></bip-list-ref>
            </template>
            <template v-else-if="cell.editType!== 1&&cell.refValue">
                <bip-aid-ref :cds="cds" :cell="cell" :index="index" :model="model"></bip-aid-ref>
            </template>
            <template v-else>
                <bip-grid-show :cds="cds" :cell="cell" :index="index" :model="model"></bip-grid-show>
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
export default class BipGridLay extends Vue{
    @Prop() cds?:CDataSet
    @Prop() cell?:Cell
    @Prop() bill?:boolean
    @Provide() status:string = 'display'
    @Prop() index?:number
    @Prop() model?:string

    onClick(){
        if(this.cds){
            this.cds.currRecord = this.cds.cdata._data[this.index||0]
        }
        if(this.bill)
            this.status = 'editor'
        // console.log('点击了我')
    }

    onBlur(){
        this.status = 'display'
        // console.log('失去焦点')
    }

    finished(){
        // console.log('finish')
        this.status = 'display'
    }
}
</script>
