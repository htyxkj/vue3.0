<template>
    <div class="bip-show-common">
        {{Name}}
        <!-- <span class="bip-ref-name"></span> -->
        <!-- <div class="bip-ref-icon"><i class="el-icon-search"></i></div> -->
    </div>
    
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import LinkRef from '@/classes/LinkRef';
import { State, Action, Getter, Mutation } from "vuex-class";
import { AssistState } from "@/store/modules/assist/types";
@Component({})
/**
 * 辅助参照
 */
export default class BipAidRef extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() index!:number
    @Prop() model?:string
    @Provide() model1:any = ''
    @Provide() multiple:boolean = false
    @Provide() bfmt:boolean = false
    @Provide() bcode:boolean = false
    @Provide() showValues:any = ''
    @Provide() linkRef:LinkRef = new LinkRef('')


    @Provide() refId: string = ""; //参照ID
    @Provide() refBcl: boolean = false; //参照是否是常量
    @Getter("AID_INFOS", { namespace: "assit" }) aidMap: any;
    @Getter("KEY_MAPS", { namespace: "assit" }) keyMaps: any;
    @Getter("AID_VALUES", { namespace: "assit" }) aidValues: any;
    @Getter("CL_INFOS", { namespace: "assit" }) clMap: any;
    @Mutation("setAidInfo", { namespace: "assit" }) setAidInfo: any;
    @Mutation("setCLInfo", { namespace: "assit" }) setCLInfo: any;
    @Mutation("setAidValue", { namespace: "assit" }) setAidValue: any;
    @Action("fetchAssist", { namespace: "assit" }) fetchAssist: any;
    @Action("fetchCLById", { namespace: "assit" }) fetchCLById: any;
    @Action("fetchRefById", { namespace: "assit" }) fetchRefById: any;
    mounted(){
        // if(this.cds&&this.cell){
        this.model1 = this.model?this.model+'':'' 
        this.multiple = (this.cell.attr&0x200000)>0
        this.bfmt = (this.cell.attr&0x10000)>0
        this.bcode = (this.cell.attr&0x40000)>0
        let str = this.cell.refValue
        if(str.length>0){
            this.refId = str.startsWith('{')?str.substring(1,str.length-1):str
            this.refBcl = this.refId.startsWith('$')
            this.refId = this.refId.substring(1)
        }

        this.linkRef = new LinkRef(this.refId,this.refBcl,this.multiple)
        this.linkRef.realV = this.model1
        this.linkRef.showV = this.model1      
        if(this.model1){
            // console.log('设置参照',this.cell.id)
            this.makeRef()
        }
                
        // }
    }

    makeRef(){
        if(this.refId){
            let res:any
            if(this.refBcl){
                res = this.getCLInfo(this.refId)
            }else{
                res = this.getAidInfos(this.refId)
            }
            // console.log(res,'12321321')
            if(res){
                this.linkRef.layCells = res.layCells
                this.linkRef.title = res.title
                this.linkRef.initOK = true
                if(this.refBcl){
                    this.linkRef.values = res.values
                    this.linkRef.makeShow()
                }else{
                    this.makeRefValues()                    
                }
            }else{
                let key = this.refId;
                if(this.refBcl)
                    key = 'CL_'+key
                if(!this.keyMaps.get(key)){
                    if(this.refBcl){
                        this.fetchCLById(this.refId)
                    }else{
                        this.fetchAssist({id:this.refId,value:this.model1})
                    }
                }
            }
        }
    }

    makeRefValues(){
        if(this.linkRef.initOK){
            let key = this.refId+'_'+this.model
            let r = this.getAidValues(key);
            if(r&&r !== this.linkRef.values){
                this.linkRef.values = r;
                this.linkRef.makeShow();
            }else{
                if(!this.keyMaps.get(key))
                    this.fetchRefById({key:this.refId,model:this.model1,cont:this.linkRef.makeSearchCont()})
            }
        }
    }

    getCLInfo(key: string) {
        key = 'CL_'+key
        let res = this.clMap.get(key);
        if (!res) {
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            if(!res)
                this.setCLInfo({ key: key, value: res });
        }
        return res;
    }

    getAidInfos(key: string) {
        let res = this.aidMap.get(key);
        // console.log(res, "321321321");
        if (!res) {
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            this.setAidInfo({ key: key, value: res });
        }
        return res;
    }
    getAidValues(key:string){
        let res = this.aidValues.get(key)
        // console.log(res,'getAidValues')
        if(!res){
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            this.setAidInfo({ key: key, value: res });
        }
        return res
    }

    get Name(){
        if(this.bfmt){
            return this.linkRef.realV+":"+this.linkRef.showV
        }
        if(this.bcode){
            return this.linkRef.realV
        }
        return this.linkRef.showV
    }

    @Watch("clMap")
    clMapChange(){
        if(this.refBcl&&!this.linkRef.initOK){
            let res = this.clMap.get('CL_'+this.refId)
            if(res){
                this.linkRef.layCells = res.layCells
                this.linkRef.title = res.title
                this.linkRef.values = res.values
                this.linkRef.initOK = true
            }
        }
    }
    @Watch("model")
    modelChange(){
        this.makeRef();
    }
    @Watch("aidMap")
    aidMapChange(){
        if(!this.refBcl&&!this.linkRef.initOK){
            let res = this.aidMap.get(this.refId)
            if(res){
                this.linkRef.layCells = res.layCells
                this.linkRef.title = res.title
                this.linkRef.initOK = true
            }
        }
    }

    @Watch("aidValues")
    somChange() {
    if(!this.refBcl){
        if(this.model){
            let key = this.refId+'_'+this.model
            let r = this.getAidValues(key);
            if(r&&r !== this.linkRef.values){
                this.linkRef.values = r;
                this.linkRef.makeShow();
            }
        }
    }
        // console.log("aidValues change");
    }

    @Watch('model')
    dataChange(){
        if(this.model !== this.model1){
            this.model1 = this.model+''
            this.linkRef.realV = this.model||''
            this.linkRef.showV = this.model||''
            if(this.model1){
                if(this.refBcl){
                    this.linkRef.makeShow();
                }else{
                    this.makeRefValues()
                }
            }
        }
        // this.model1 = this.model?this.model:'' 
        // this.makeRef()
        // console.log('辅助变了')
    }
}
</script>

<style lang="scss">
.bip-show-common{
    width:100%;
    text-align: center;
}
.bip-show-money{
    width:100%;
    text-align: right;
}
</style>


