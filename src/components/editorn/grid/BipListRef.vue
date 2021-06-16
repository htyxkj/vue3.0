<template>
    <div class="bip-show" :disabled="disabled">
       {{showValues}}
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { Cell } from '../../../classes/pub/coob/Cell';
import BipInsAidNew from '../../../classes/BipInsAidNew';
@Component({})
export default class BipListRef extends Vue{
    @Prop() cell!:Cell
    @Prop() bipInsAid!:BipInsAidNew

    @Prop() model!:string

    disabled:boolean = false
    multiple:boolean = false
    bfmt:boolean = false
    bcode:boolean = false
    mounted(){
        this.disabled = (this.cell.attr & 0x40) > 0;
        this.multiple = (this.cell.attr & 0x200000) > 0;
        this.bfmt = (this.cell.attr & 0x10000) > 0;
        this.bcode = (this.cell.attr & 0x40000) > 0;
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
                    let values = []
                    if(this.multiple){
                        values = m.split(";");
                    }else{
                        values = [m]
                    }
                    for(var i=0;i<values.length;i++){
                        if(item[id]+'' == values[i]){
                            if(this.bfmt)
                                str += values[i]+":"+item[name]
                            else{
                                str += item[name]
                            }
                            if(i<values.length-1){
                                str += ";"
                            }
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
