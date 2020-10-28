<template>
    <div class="bip-show" :disabled="disabled">
       {{model1}}
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { State, Action, Getter, Mutation } from "vuex-class";
import CDataSet from '../../../classes/pub/CDataSet';
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
    @Prop() cds!:CDataSet
    @Prop() bipInsAid!:BipInsAidNew //参照对象
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
    @Provide() refLink!:BipInsAidNew
    @Provide() aidMarkKey:string = "";
    mounted(){
        this.aidMarkKey = this.cds.ccells.obj_id + "_" + this.cell.id+'_';
        this.refLink = Object.assign({},this.bipInsAid)
        this.disabled = (this.cell.attr & this.attr.READ) > 0;
        this.multiple = (this.cell.attr & this.attr.MULTIPLE) > 0;
        this.bfmt = (this.cell.attr & this.attr.FMT) > 0;
        this.bcode = (this.cell.attr & this.attr.CODE) > 0;
        this.model1 = this.model
        if(this.model&&this.model.length>0){
            if(this.bcode){
               
            }else{
                this.getRefValues()
            }
        }
    }

    getRefValues(){
        if(this.refLink && this.refLink.id.length>0 && this.model && this.model.length>0 && this.refLink.cells){
            console.log(this.refLink)
             this.refLink.values = []
            if(this.model&&this.model.length>0){
                if(this.model&&this.model.length>0){
                let vlarr = this.model.split(";")
                var values:any = [];
                for(var i=0;i<vlarr.length;i++){
                    let cont = this.refLink.cells.cels[0].id+"='"+vlarr[i]+"' "
                    let key = ICL.AID_KEY+this.aidMarkKey+this.refLink.id+"_"+vlarr[i]
                    let vrs = this.aidValues.get(key);
                    if(!vrs){
                        let str = window.sessionStorage.getItem(key)
                        if(!str){
                            let vvs = {id:this.refLink.id,key:key,cont:cont}
                            this.fetchInsDataByCont(vvs)
                        }else{
                            vrs = JSON.parse(str);
                            this.setAidValue({key:key,value:vrs})
                            values.push(vrs);
                        }
                    }else{
                        values.push(vrs);
                    }

                }
                this.refLink.values = []
                this.refLink.values = values
                this.makeShow()
            }

            //     let cont = this.refLink.cells.cels[0].id+"='"+this.model+"' "
            //     let key = ICL.AID_KEY+this.aidMarkKey+this.refLink.id+"_"+this.model
            //     let vrs = this.aidValues.get(key);
            //     if(!vrs){
            //         let str = window.sessionStorage.getItem(key)
            //         if(!str){
            //             let vvs = {id:this.refLink.id,key:key,cont:cont}
            //             this.fetchInsDataByCont(vvs)
            //         }else{
            //             vrs = JSON.parse(str);
            //             this.setAidValue({key:key,value:vrs})
            //             this.refLink.values = []
            //             this.refLink.values[0] = vrs
            //             this.makeShow()
            //         }
            //     }else{
            //         this.refLink.values = []
            //         this.refLink.values[0] = vrs
            //         this.makeShow()
            //     }

            // }else{
            //     this.refLink.realV = this.model
            //     this.refLink.showV = this.refLink.realV
            //     this.makeShow()
            // }
            }
        }
    }

 makeShow() {
        // if(!this.bcode){
        //     if(this.refLink.values&&this.refLink.values.length>0){
        //         let vv = this.refLink.values[0];
        //         if(vv){
        //             this.refLink.showV = vv[this.refLink.cells.cels[1].id]||this.refLink.realV
        //         }else{
        //             this.refLink.showV = this.refLink.realV
        //         }
        //     }else{
        //         this.refLink.realV = this.model1
        //         this.refLink.showV = this.refLink.realV
        //     }
        // }else{
        //     this.refLink.realV = this.model
        //     this.refLink.showV = this.refLink.realV
            
        // }
        // this.model1 = this.refLink.showV     
        if(!this.bcode){
            if(this.refLink.values&&this.refLink.values.length>0){
                if(this.refLink.values){
                    this.refLink.showV = ''
                    for(var i=0;i<this.refLink.values.length;i++){
                        let vv = this.refLink.values[i];
                        this.refLink.showV += vv[this.refLink.cells.cels[1].id]+";"||this.refLink.realV+";"
                    }
                    if(this.refLink.showV.length>1)
                    this.refLink.showV = this.refLink.showV.substring(0,this.refLink.showV.length-1)
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
        // console.log("aidValues")
        if(this.refLink&&this.refLink.id.length>0&&this.model){
            let vlarr = this.model.split(";");
            let values = [];
            for(var i=0;i<vlarr.length;i++){
                let cont = this.refLink.cells.cels[0].id+"='"+vlarr[i]+"' "
                let key = ICL.AID_KEY+this.aidMarkKey+this.refLink.id+"_"+vlarr[i]
                let vrs = this.aidValues.get(key);
                if(!vrs){
                    let vvs:any ={};
                    vvs[this.refLink.cells.cels[0].id] = vlarr[i]
                    vvs[this.refLink.cells.cels[1].id] = vlarr[i]
                }else{
                    values.push(vrs);
                }

            }
            this.refLink.values = []
            this.refLink.values = values;
            this.makeShow()
        }
        // if(this.refLink&&this.refLink.id.length>0&&this.model){
        //     let key = ICL.AID_KEY+this.aidMarkKey+this.refLink.id+"_"+this.model
        //     let vvs = this.aidValues.get(key);
        //     if(vvs){
        //         this.refLink.realV = this.model
        //         this.refLink.values = []
        //         this.refLink.values[0] = vvs
        //         this.makeShow()
        //     }else{
        //         this.model1 = this.model
        //         this.refLink.realV = this.model
        //         this.refLink.values = []
        //         this.makeShow()
        //     }
        // }
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
    }   
}
</script>


<style lang="scss">
.bip-show{
    width: 100%;
    padding: 0 0;
}
</style>
