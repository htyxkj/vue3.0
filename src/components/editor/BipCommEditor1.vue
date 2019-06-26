<template>
    <div>
        <template v-if="editorType == I_EDITOR_LIST">
            <bip-list-editor  :cell="cell" :cds="cds" :model="value+''"></bip-list-editor>
        </template>
        <template v-else-if="editorType == I_EDITOR_DATE">
            <bip-date-editor :cell="cell" :cds="cds" :model="value"></bip-date-editor>
        </template>
        <template v-else-if="editorType == I_EDITOR_SELECT">
            <bip-select-editor :cell="cell" :cds="cds" :model="value"></bip-select-editor>
        </template>
            <template v-else-if="editorType == I_EDITOR_NUM">
            <bip-number-editor :cell="cell" :cds="cds" :model="value"></bip-number-editor>
        </template>
        <template v-else-if="editorType == I_EDITOR_UPDOWN">
            <bip-up-down-editor :cell="cell" :cds="cds" :model="value"></bip-up-down-editor>
        </template>
        <template v-else-if="editorType == I_EDITOR_COPY">
            <bip-copy-editor :cell="cell" :cds="cds" :model="value"></bip-copy-editor>
        </template>
        <template v-else>
            <bip-input-editor :cell="cell" :cds="cds" :model="value"></bip-input-editor>
        </template>      
        <!-- <bip-no-yes-editor v-else-if="cell.editType == 5" :cell="cell" :cds="cds"></bip-no-yes-editor> --> 
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipInputEditor from './BipInputEditor.vue'
import BipListEditor from './BipListEditor.vue'
import BipDateEditor from './BipDateEditor.vue'
import BipSelectEditor from './BipSelectEditor.vue'
import BipUpDownEditor from './BipUpDownEditor.vue'
import BipNumberEditor from './BipNumberEditor.vue'
import BipCopyEditor from './BipCopyEditor.vue'
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
@Component({
    components:{BipInputEditor,BipListEditor,BipDateEditor,BipSelectEditor,BipUpDownEditor,BipNumberEditor,BipCopyEditor}
})
export default class BipCommEditor1 extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Provide() editorType:number = 0
    @Provide() I_EDITOR_LIST = ICL.I_EDITOR_LIST
    @Provide() I_EDITOR_DATE = ICL.I_EDITOR_DATE
    @Provide() I_EDITOR_UPDOWN = ICL.I_EDITOR_UPDOWN
    @Provide() I_EDITOR_SELECT = ICL.I_EDITOR_SELECT
    @Provide() I_EDITOR_COMM = ICL.I_EDITOR_COMM
    @Provide() I_EDITOR_NUM = ICL.I_EDITOR_NUM
    @Provide() I_EDITOR_COPY = ICL.I_EDITOR_COPY
    @Provide() model:any = ''
    @Provide() bsearch:boolean = false
    mounted(){
            this.model = this.cds.currRecord[this.cell.id]
            this.bsearch = (this.cds.ccells.attr&0x80)>0
            if(this.cell.editType == 1||this.cell.editType == 4||this.cell.editType ==5 ||this.cell.id ==='state'){
                this.editorType = ICL.I_EDITOR_LIST
                this.model+=''
                return 
            }else{
                if(this.cell.type ===3){
                    this.editorType = ICL.I_EDITOR_NUM
                    this.model+=''
                    return 
                }
                if(this.cell.type === 91 || this.cell.type ===93) {
                    if(this.bsearch)
                        this.editorType = ICL.I_EDITOR_COMM
                    else
                        this.editorType = ICL.I_EDITOR_DATE
                    return 
                }
                if(this.cell.assist){
                    if(this.cell.editName == 'UPDOWN'){
                        this.editorType = ICL.I_EDITOR_UPDOWN
                    }else if(this.cell.editName == 'COPY'){
                        this.editorType = ICL.I_EDITOR_COPY
                    }else{
                        this.editorType = ICL.I_EDITOR_SELECT
                    }
                    return
                }        
                this.editorType = ICL.I_EDITOR_COMM
                return
            }
        // }    
    }

    get value(){
        if(this.cds&&this.cell){
            let crd:any = this.cds.currRecord;
            this.model = crd[this.cell.id]
            return this.model||''
        }
        return this.model
    }

}
</script>
