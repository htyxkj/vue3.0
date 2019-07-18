<template>
    <div class="bip-show" :disabled="disabled">
       {{model1}}
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { State, Action, Getter, Mutation } from "vuex-class";
// import CDataSet from '../../../classes/pub/CDataSet';
import { Cell } from '../../../classes/pub/coob/Cell';
import {CommICL} from '@/utils/CommICL'
// import { BIPUtils } from '@/utils/BaseUtil'
import BipInsAidNew from '../../../classes/BipInsAidNew';
import CommAttr from '../../../classes/CommAttr';
// let baseTool = BIPUtils.baseUtil
let ICL = CommICL
@Component({})
export default class BipAidRef extends Vue{
    @Prop() cell!:Cell
    @Prop() refLink!:BipInsAidNew //参照对象
    @Prop() model!:string
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @Action("fetchInsDataByCont", { namespace: "insaid" }) fetchInsDataByCont: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;

    @Provide() disabled:boolean = false
    @Provide() multiple:boolean = false
    @Provide() bfmt:boolean = false
    @Provide() bcode:boolean = false

    @Provide() attr:CommAttr = new CommAttr()

    @Provide() model1:string = ''

    mounted(){
        this.disabled = (this.cell.attr & this.attr.READ) > 0;
        this.multiple = (this.cell.attr & this.attr.MULTIPLE) > 0;
        this.bfmt = (this.cell.attr & this.attr.FMT) > 0;
        this.bcode = (this.cell.attr & this.attr.CODE) > 0;
        this.model1 = this.model
        if(this.model&&this.model.length>0){
            console.log(this.model)
            if(this.bcode){
               
            }else{
                this.getRefValues()
            }
        }
    }

    getRefValues(){
        if(this.refLink&&this.refLink.id.length>0&&this.model.length>0){
            console.log(this.refLink,'fdsfdsfdsfd')
             this.refLink.values = []
            if(this.model&&this.model.length>0){
                let cont = this.refLink.cells.cels[0].id+"='"+this.model+"' "
                let key = ICL.AID_KEY+this.refLink.id+"_"+this.model
                console.log('获取辅助值',key)
                let vrs = this.aidValues.get(key);
                console.log('获取辅助值',key,vrs)
                if(!vrs){
                    console.log('缓存没有',key,vrs)
                    let str = window.sessionStorage.getItem(key)
                    console.log('session没有',key,vrs)
                    if(!str){
                        let vvs = {id:this.refLink.id,key:key,cont:cont}
                        console.log('服务器获取',vvs)
                        this.fetchInsDataByCont(vvs)
                    }else{
                        vrs = JSON.parse(str);
                        this.setAidValue({key:key,value:vrs})
                        this.refLink.values = []
                        this.refLink.values[0] = vrs
                        this.makeShow()
                    }
                }else{
                    this.refLink.values = []
                    this.refLink.values[0] = vrs
                    this.makeShow()
                }

            }else{
                this.refLink.realV = this.model
                this.refLink.showV = this.refLink.realV
                this.makeShow()
            }
        }
    }

 makeShow() {
        if(!this.bcode){
            if(this.refLink.values&&this.refLink.values.length>0){
                let vv = this.refLink.values[0];
                console.log(this.refLink)
                if(vv){
                    this.refLink.showV = vv[this.refLink.cells.cels[1].id]||this.refLink.realV
                }else{
                    this.refLink.showV = this.refLink.realV
                }
            }else{
                this.refLink.realV = this.model1
                this.refLink.showV = this.refLink.realV
            }
        }else{
            this.refLink.realV = this.model
            this.refLink.showV = this.refLink.realV
            
        }
        this.model1 = this.refLink.showV     
    }

    @Watch('aidValues')
    aidValuesChange(){
    console.log('aidValues change',this.model)
        if(this.refLink&&this.refLink.id.length>0&&this.model){
            let key = ICL.AID_KEY+this.refLink.id+"_"+this.model
            let vvs = this.aidValues.get(key);
            console.log('获取到值：',key,vvs);
            if(vvs){
                this.refLink.realV = this.model
                this.refLink.values = []
                this.refLink.values[0] = vvs
                this.makeShow()
            }else{
                console.log('fdsfds',this.model1)
                this.model1 = this.model
                this.refLink.realV = this.model
                this.refLink.values = []
                this.makeShow()
            }
        }
    }

    @Watch('model')
    valuesChange(){
        if(this.bcode){
            this.model1 = this.model
        }else{
            this.model1 = this.model
            this.refLink.realV = this.model
            this.getRefValues()
        }
        console.log('model change')
    }   
}
</script>


<style lang="scss">
.bip-show{
    width: 100%;
    padding: 0 0;
}
</style>
