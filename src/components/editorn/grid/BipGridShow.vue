<template>
    <div :class="uiclass">{{model1}}</div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import {CurrUtils} from '@/utils/CurrUtils'
let currutil = CurrUtils.curr
@Component({})
export default class BipGridShow extends Vue{
    @Prop() cell!:Cell
    @Prop() model!:string
    @Provide() model1:string = ''
    @Provide() uiclass:string='bip-show-common'
    mounted(){
        this.model1 = this.model ||''
        if(this.model1=="Invalid date" || this.model1 == 'NaN'){
            this.model1 = ''
        }

        if(this.cell&&this.cell.type==3){
            this.uiclass = 'bip-show-money'
            const point  = this.cell.ccPoint<0?2:this.cell.ccPoint
            // this.model1 = XEUtils.toFixedString(this.model1,point)
            this.model1 = currutil.currency(this.model1,'',point);
        }
    }

    

    @Watch('model')
    modelChange(){
        this.model1 = this.model ||''
        if(this.model1=="Invalid date"){
            this.model1 = ''
        }
        if(this.cell&&this.cell.type==3){
            const point  = this.cell.ccPoint<0?2:this.cell.ccPoint
            // this.model1 = XEUtils.toFixedString(this.model1,point)
            this.model1 = currutil.currency(this.model1,'',point);
        }
    }


}
</script>

<style lang="scss" scoped>
.bip-show-common{
    width:100%;
    text-align: center;
}
.bip-show-money{
    width:100%;
    text-align: right;
}
</style>



