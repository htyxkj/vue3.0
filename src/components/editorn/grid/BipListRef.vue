<template>
    <div class="bip-show" :disabled="disabled">
       {{showValues}}
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
// import { State, Action, Getter, Mutation } from "vuex-class";
// import CDataSet from '../../../classes/pub/CDataSet';
import { Cell } from '../../../classes/pub/coob/Cell';
// import {CommICL} from '@/utils/CommICL'
// import { BIPUtils } from '@/utils/BaseUtil'
import BipInsAidNew from '../../../classes/BipInsAidNew';
// let baseTool = BIPUtils.baseUtil
// let ICL = CommICL
@Component({})
export default class BipListRef extends Vue{
    // @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    // @Prop() row!:number
    @Prop() bipInsAid!:BipInsAidNew

    @Prop() model!:string

    @Provide() disabled:boolean = false
    @Provide() multiple:boolean = false
    @Provide() bfmt:boolean = false
    @Provide() bcode:boolean = false
    // @Provide() linkName:string = ""
    // @Provide() eventId:number = 0
    mounted(){
        this.disabled = (this.cell.attr & 0x40) > 0;
        this.multiple = (this.cell.attr & 0x200000) > 0;
        this.bfmt = (this.cell.attr & 0x10000) > 0;
        this.bcode = (this.cell.attr & 0x40000) > 0;
        // if(this.model&&this.model.length>0){
        // }
        // this.cellEdit()
        // this.eventId = this.$bus.$on('cell_edit',this.cellEdit)
    }

    @Watch('model')
    valuesChange(){
    }

    get showValues(){
        let str = ""
        let m = this.model?(this.model+''):''
        if(this.bcode){
            return m
        }
        if(this.bipInsAid){
            if(this.bipInsAid&&this.bipInsAid.cells&&this.bipInsAid.values){
                let id = this.bipInsAid.cells.cels[0].id
                let name = this.bipInsAid.cells.cels[1].id
                this.bipInsAid.values.forEach(item=>{
                    if(item[id]+'' == m){
                        if(this.bfmt)
                            str = m+":"+item[name]
                        else{
                            str = item[name]
                        }
                    }
                })

            }
            if(str.length<1){
                str = m
            }
        }
        return str
    }    
}
</script>


<style lang="scss">
.bip-show{
    width: 100%;
    padding: 0 0;
}
</style>
