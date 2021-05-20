<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq"> 
                <span slot="label" v-if="cell.labelString">
                    <template v-if="cell.labelString.length>(cell.isReq?4:6)">
                        <el-tooltip class="item" effect="dark" :content="cell.labelString" placement="top">
                            <span>{{cell.labelString.substring(0,(cell.isReq?4:6))}}…</span>
                        </el-tooltip>
                    </template>
                    <template v-else>
                        {{cell.labelString}}
                    </template>
                </span> 
                <img class="img" @click="write()" :src="model1"/>
            </el-form-item>
        </template>
        <template v-else>
            <img class="img" :src="model1"  @click="write()"/>
        </template>
        <el-dialog title="签字板" :visible.sync="showSignature" class="bip-query"  :append-to-body="true"  :close-on-press-escape="true" :close-on-click-modal="false" width="60%">
            <template v-if="canvas_isimg">
                <div style="text-align: center;height: 300px;">
                    <img style="height:300px;width:650px;border: 1px solid red;" :src="model1"/>
                </div>
            </template>
            <template v-else>
                <div style="text-align: center;height: 300px;">
                    <canvas id="thecanvas" @touchstart='touchStart' @touchmove='touchMove' @touchend='touchEnd'  :ref="cell.id+'canvasF'"   @mousedown="mouseDown" @mousemove="mouseMove" @mouseup="mouseUp"></canvas>
                </div>
            </template>
            <div slot="footer" class="dialog-footer">
                <el-button @click="overwrite" v-if="cds.currCanEdit()">重 写</el-button>
                <el-button type="primary" @click="save">确 定</el-button>
            </div>
        </el-dialog>
            
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL

import { State, Action, Getter, Mutation } from "vuex-class";
import BipInsAidNew from '../../classes/BipInsAidNew';
@Component({})
export default class BipAutograph extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Prop() row!:number
    @Prop() bipInsAid!:BipInsAidNew
    @Provide() model1:any = [];
    @Provide() clearable:boolean = true
    @Provide() multiple:boolean = false
    @Provide() options:any = []
    @Provide() refId:string = ''
    @Provide() initOK:boolean = false
    @Provide() span:number = 6

    @Provide() methodName:string = ''
    @Provide() cels!:Array<Cell>

    @Provide() showSignature:boolean = false;
    @Provide() canvasTxt:any = null;
    @Provide() startX:any= 0
    @Provide() startY:any= 0
    @Provide() moveY:any= 0
    @Provide() moveX:any= 0
    @Provide() endY:any= 0
    @Provide() endX:any= 0
    @Provide() points:any=[]
    @Provide() isDown:boolean = false;
    @Provide() lt:any = null;
    @Provide() canvas:any = null;
    @Provide() canWidth:any=650;
    @Provide() canHeight:any=300;
    @Provide() canvas_isimg:boolean = false;
    mounted(){ 
        let record = this.cds.currRecord
        this.model1 =record.data[this.cell.id];
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
    } 
    write(){
        this.$emit("focus",{})
        this.showSignature = true; 
        if(this.model1 != null && this.model1 !=''){
            this.canvas_isimg = true;
        }else{
            setTimeout(() => {
                this.canvas=this.$refs[this.cell.id+'canvasF'];
                this.canvas.height = this.canHeight
                this.canvas.width = this.canWidth;
                this.canvasTxt=this.canvas.getContext("2d");
                this.canvasTxt.fillStyle = "#FFFFFF";
                this.canvasTxt.fillRect(0,0,this.canvas.width,this.canvas.height); 
                this.lt = this.getPosition(this.$refs[this.cell.id+'canvasHW'])
            }, 300);
        }
    }
    getPosition(obj:any){
        var l=0;
        var t=0;
        while(obj){
            l+=obj.offsetLeft;
            t+=obj.offsetTop;
            obj=obj.offsetParent;
        }
        return {left:l, top:t};
    }
    //电脑设备事件
    mouseDown(ev:any){
        ev = ev || event;
        ev.preventDefault(); 
        if(1){
            let obj={
                x:ev.offsetX,
                y:ev.offsetY
            }; 
            this.startX=obj.x;
            this.startY=obj.y;
            this.canvasTxt.beginPath();
            this.canvasTxt.moveTo(this.startX, this.startY);
            this.canvasTxt.lineTo(obj.x, obj.y);
            this.canvasTxt.stroke();
            this.canvasTxt.closePath();
            this.points.push(obj);
            this.isDown=true;
        }
    }
        //移动设备事件 开始绘制
    touchStart(ev:any){ 
        this.canvasTxt.beginPath();
        var x = ev.changedTouches[0].pageX - this.lt.left;
        var y = ev.changedTouches[0].pageY - this.lt.top;
        this.canvasTxt.moveTo(x, y);
    }
    //电脑设备事件
    mouseMove(ev:any){
        ev = ev || event;
        ev.preventDefault();
        if(this.isDown){
            let obj={
                x:ev.offsetX,
                y:ev.offsetY
            };
            this.moveY=obj.y;
            this.moveX=obj.x;
            this.canvasTxt.beginPath();
            this.canvasTxt.moveTo(this.startX, this.startY);
            this.canvasTxt.lineTo(obj.x, obj.y);
            this.canvasTxt.stroke();
            this.canvasTxt.closePath();
            this.startY=obj.y;
            this.startX=obj.x;
            this.points.push(obj);
        }
    }
        //移动设备事件 绘制中
    touchMove(ev:any){ 
        var x = ev.changedTouches[0].pageX - this.lt.left;
        var y = ev.changedTouches[0].pageY - this.lt.top;
        this.canvasTxt.lineTo(x, y); 
        this.canvasTxt.stroke();
    }
    //电脑设备事件
    mouseUp(ev:any){
        ev = ev || event;
        ev.preventDefault();
        if(1){
            let obj={
                x:ev.offsetX,
                y:ev.offsetY
            };
            this.canvasTxt.beginPath();
            this.canvasTxt.moveTo(this.startX, this.startY);
            this.canvasTxt.lineTo(obj.x, obj.y);
            this.canvasTxt.stroke();
            this.canvasTxt.closePath();
            this.points.push(obj);
            this.points.push({x:-1,y:-1});
            this.isDown=false;
        }
    }
    //移动设备事件 结束绘制
    touchEnd(ev:any){ 
        this.canvasTxt.closePath();
    }
    //重写
    overwrite(){
        if(this.canvas_isimg){
            this.canvas_isimg = false;
            setTimeout(() => {
                this.canvas=this.$refs[this.cell.id+'canvasF'];
                this.canvas.height = this.canHeight
                this.canvas.width = this.canWidth;
                this.canvasTxt=this.canvas.getContext("2d");
                this.canvasTxt.fillStyle = "#FFFFFF";
                this.canvasTxt.fillRect(0,0,this.canvas.width,this.canvas.height); 
                this.lt = this.getPosition(this.$refs[this.cell.id+'canvasHW'])
                this.overwrite();
            }, 300);
        }else{
            this.canvas_isimg = false;
            this.canvasTxt.clearRect(0, 0, this.canWidth, this.canHeight);
            this.points=[];
        }
    }
    //提交签名
    save(){ 
        if(this.canvas_isimg){
            this.showSignature = false;
        }
        var imgBase64 = this.canvas.toDataURL(); 
        if( imgBase64 !== this.model){
            if(this.cds.currCanEdit()){
                this.$emit("dataChange",imgBase64)
                this.cds.setStateOrAnd(icl.R_EDITED)
                let record = this.cds.currRecord
                record.data[this.cell.id] = imgBase64
                this.cds.currRecord = Object.assign({},record);
                this.cds.cdata.data[this.cds.index] = Object.assign({},record)
                const key:string = this.cell.id
                if(this.cds.baseI){
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,imgBase64)
                }
                this.cds.cellChange(key,imgBase64);
                this.cds.currRecord.c_state |= 2;
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
                this.model1 =  imgBase64;
                this.canvas_isimg = true;
                this.showSignature = false;
            }
        }
    }
    @Watch('model')
    valueChange(){
        this.model1 = this.model||''
    }
}
</script>
<style scoped>
.img{ 
    border: 1px solid red;
    height: 30px; 
    width: 100%; 
  }
canvas{
    border: 1px solid red;
  } 
</style>


