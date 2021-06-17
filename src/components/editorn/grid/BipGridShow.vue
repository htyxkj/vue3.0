<template>
    <div>
        <div v-if="editType == 6">
            <img :src="imgUrl" class="gridImg" v-viewer/>
        </div>
        <div v-else :class="uiclass" :style="valStyle2">{{model1}}</div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { Cell } from '@/classes/pub/coob/Cell';
import {CurrUtils} from '@/utils/CurrUtils'
import {BaseVariable} from "@/utils/BaseICL"
let currutil = CurrUtils.curr
@Component({
    components:{}
})
export default class BipGridShow extends Vue{
    @Prop() cell!:Cell
    @Prop() model!:string
    model1:string = ''
    uiclass:string='bip-show-common'
    editType:any = null;
    imgUrl:any = null;
    valStyle:any = "";
    valStyle2:any = "";
    mounted(){
        this.initModel();
        this.editType = this.cell.editType;
        if(this.editType ==6){
            this.makeImgUrl();
        }
        this.initStyle();
    }
    initStyle(){
        let chkRule = this.cell.chkRule
        let align = "text-align:left";
        if(this.cell.type==3){
            align = "text-align:right";
        }
        if(chkRule){
            if(chkRule.indexOf("&") >0){
                let type:any = chkRule.split("&")[0];
                type = parseInt(type);
                if(type == 1){
                    align ="text-align:center"
                }else if(type == 2){
                    align ="text-align:right"
                }
            }
        } 
        this.valStyle += align;
        this.valStyle2 = this.valStyle;
    }

    initModel(){
        this.model1 = this.model ||''
        if(this.model1=="Invalid date"){
            this.model1 = ''
        }
        if(this.cell&&this.cell.type==3){
            const point  = this.cell.ccPoint<0?2:this.cell.ccPoint
            // this.model1 = XEUtils.toFixedString(this.model1,point)
            this.model1 = currutil.currency(this.model1,'',point);
            if(parseFloat(this.model1)<0){
                this.valStyle2=this.valStyle+";color:red";
            }else{
                this.valStyle2=this.valStyle;
            }
        }
        if(this.model1 &&　this.cell&& this.cell.editName =='HS'){
            if(this.model1.length ==1){
                this.model1 = "000"+this.model1
            }else if(this.model1.length ==2){
                this.model1 = "00"+this.model1
            }else if(this.model1.length ==3){
                this.model1 = "0"+this.model1
            }
            if(this.model1.indexOf(":") == -1　&& this.model1.length>=4){
                let h = this.model1.substring(0,2);
                let m = this.model1.substring(2);
                this.model1 = h+":"+m
            }
        }
    }

    @Watch('model')
    modelChange(){
        this.initModel();
        this.makeImgUrl();
    }
    //组成图片路径
    makeImgUrl(){
        this.imgUrl = BaseVariable.BaseUri+"/db_"+BaseVariable.COMM_FLD_VALUE_DBID+"/"+this.model1
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
.gridImg{
    width: 1.25rem;
    height: 1.25rem;
    padding-top: 5px;
}
</style>



