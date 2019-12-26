<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="dateTime">
            <template v-if="!bgrid">
                <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                    <template v-if="condition"><!-- 报表条件 -->
                        <el-date-picker size="small" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                            v-model="model1"
                            type="datetimerange"
                            :picker-options="pickerOptions"
                            range-separator="~"
                            :format="dateFormat"
                            :value-format="dateFormat"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            placeholder="选择日期" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                            </el-date-picker>
                    </template>
                    <template v-else>
                        <el-date-picker size="small" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                            v-model="model1"
                            :type="dateType"
                            :format="dateFormat"
                            :value-format="dateFormat"
                            :picker-options="optionaIint"
                            placeholder="选择日期" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                        </el-date-picker>
                    </template>
                    <template v-if="cell.desc">
                        <span style="position:relative;line-height:32px;width:29px;padding: 5px 0px 5px 5px;">
                            <el-tooltip class="item" effect="dark" :content="cell.desc" placement="top">
                                <i class="iconfont icon-bip-bangzhu" style="font-size:14px;"></i>
                            </el-tooltip>
                        </span>
                    </template>
                </el-form-item>
            </template>
            <template v-else>
                <el-date-picker size="small" style="width:100%"
                    v-model="model1"
                    :type="dateType"
                    :format="dateFormat"
                    :value-format="dateFormat"
                    :picker-options="optionaIint"
                    placeholder="选择日期" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                </el-date-picker>
            </template>
        </template>
        <template v-else>
            <template v-if="!bgrid">
                <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                    <template v-if="condition"><!-- 报表条件 -->
                        <el-time-picker size="small" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                            v-model="model1"
                            :picker-options="pickerOptions"
                            range-separator="~"
                            :format="dateFormat"
                            :value-format="dateFormat"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            placeholder="选择时间" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                            </el-time-picker>
                    </template>
                    <template v-else>
                        <el-time-picker size="small" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                            v-model="model1"
                            :format="dateFormat"
                            :value-format="dateFormat"
                            :picker-options="optionaIint"
                            placeholder="选择时间" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                        </el-time-picker>
                    </template>                    
                    <template v-if="cell.desc">
                        <span style="position:relative;line-height:32px;width:29px;padding: 5px 0px 5px 5px;">
                            <el-tooltip class="item" effect="dark" :content="cell.desc" placement="top">
                                <i class="iconfont icon-bip-bangzhu" style="font-size:14px;"></i>
                            </el-tooltip>
                        </span>
                    </template>
                </el-form-item>
            </template>
            <template v-else>
                <el-time-picker size="small" style="width:100%"
                    v-model="model1"
                    :format="dateFormat"
                    :value-format="dateFormat"
                    :picker-options="optionaIint"
                    placeholder="选择时间" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                </el-time-picker>
            </template>
        </template>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
import BipInsAidNew from '../../classes/BipInsAidNew';
import { symlinkSync } from 'fs';
@Component({})
export default class BipDateEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() row!:number
    @Provide() model1:any = ''
    @Provide() clearable:boolean = true
    @Provide() dateType="date"
    @Provide() dateFormat="yyyy-MM-dd"
    @Provide() methodName:string = ''
    @Provide() condition:boolean = false;
    @Provide() span:number = 6
    @Provide() pickerOptions:any = null;
    @Provide() optionaIint:any = null;
    @Provide() dateTime:boolean = true;
    mounted(){
        this.condition = (this.cds.ccells.attr&0x80)>0
        this.model1 = this.model
        console.log(this.model1)
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        // if(this.cds&&this.cell){
            if(this.cell.type===93){
                this.dateType = 'datetime'
                this.dateFormat = 'yyyy-MM-dd HH:mm:ss'
            }else if(this.cell.editName == 'YM'){
                this.dateType = 'month';
                this.dateFormat = 'yyyyMM'
            }else if(this.bipInsAid.bType == 'CHSMEditor'){
                this.dateTime = false;
                if(this.bipInsAid.id == 'HS'){
                    this.dateFormat = 'HHmm';
                }else if(this.bipInsAid.id == 'H_S'){
                    this.dateFormat = 'HH:mm';
                }else if(this.bipInsAid.id == 'H_SM'){
                    this.dateFormat = 'HH:mmss';
                }else if(this.bipInsAid.id == 'H_S_M'){
                    this.dateFormat = 'HH:mm:ss';
                }
            }else if(this.bipInsAid.bType == 'CYMEditor'){
                this.dateType = 'month';
                if(this.bipInsAid.id == 'Y-M'){                    
                    this.dateFormat = 'yyyy-MM';
                }else if(this.bipInsAid.id == 'YM'){
                    this.dateFormat = 'yyyyMM';
                }
            }
            this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id
        // }
        this.pickerOptions = {
          shortcuts: [{
            text: '最近一周',
            onClick(picker:any) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker:any) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker:any) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        }
        this.optionaIint={
            disabledDate: (time:any) => {
                return this.optionalInterval(time)
            }
        }

    }
    //判断时间是否在可选范围内
    optionalInterval(time:Date){
        if(this.cell.chkRule){
            let startTime;
            let endTime;
            let dArr = this.cell.chkRule.split("~");
            startTime = dArr[0]
            endTime = dArr[1];
            
            if(startTime && startTime!="" && endTime && endTime!=""){
                let cans;
                let cane;
                let dateAdd="";
                if(startTime.indexOf("|") ==-1){
                    startTime = startTime.substring(startTime.indexOf("[")+1,startTime.lastIndexOf("]"));                    
                }else{
                    let stt = startTime.substring(startTime.indexOf("[")+1,startTime.lastIndexOf("|"));
                    dateAdd = startTime.substring(startTime.indexOf("|")+1,startTime.lastIndexOf("]"));
                    startTime = stt;
                }
                startTime = this.cds.currRecord.data[startTime];    
                startTime = startTime.replace(new RegExp("\\-",'g'),"/");           
                if(dateAdd !=""){
                    let add = dateAdd.split(";");
                    add.unshift(startTime);
                    startTime = baseTool.dateAdd(add);
                }
                let sd = new Date(startTime);
                if(sd.getTime()<=time.getTime()){
                    cans = false;
                }else{
                    cans = true;
                }
                dateAdd = "";
                if(endTime.indexOf("|") == -1){
                    endTime = endTime.substring(endTime.indexOf("[")+1,endTime.lastIndexOf("]"));
                }else{
                    let stt = endTime.substring(endTime.indexOf("[")+1,endTime.lastIndexOf("|"));
                    dateAdd = endTime.substring(endTime.indexOf("|")+1,endTime.lastIndexOf("]"));
                    endTime = stt;
                }
                endTime = this.cds.currRecord.data[endTime];
                endTime = endTime.replace(new RegExp("\\-",'g'),"/"); 
                if(dateAdd !=""){
                    let add = dateAdd.split(";");
                    add.unshift(endTime);
                    endTime = baseTool.dateAdd(add);
                }
                let ed = new Date(endTime);
                if(ed.getTime()>=time.getTime()){
                    cane = false;
                }else{
                    cane = true;
                }
                return cans || cane
            }

            if(startTime && startTime!=""){
                let dateAdd="";
                if(startTime.indexOf("|") ==-1){
                    startTime = startTime.substring(startTime.indexOf("[")+1,startTime.lastIndexOf("]"));                    
                }else{
                    let stt = startTime.substring(startTime.indexOf("[")+1,startTime.lastIndexOf("|"));
                    dateAdd = startTime.substring(startTime.indexOf("|")+1,startTime.lastIndexOf("]"));
                    startTime = stt;
                }
                startTime = this.cds.currRecord.data[startTime];
                startTime = startTime.replace(new RegExp("\\-",'g'),"/"); 
                if(dateAdd !=""){
                    let add = dateAdd.split(";");
                    add.unshift(startTime);
                    startTime = baseTool.dateAdd(add);
                }
                let sd = new Date(startTime);     
                if(sd.getTime()<=time.getTime()){
                    return false;
                }else{
                    return true;
                }
            }
            if(endTime && endTime!=""){
                let dateAdd ="";
                if(endTime.indexOf("|") == -1){
                    endTime = endTime.substring(endTime.indexOf("[")+1,endTime.lastIndexOf("]"));
                }else{
                    let stt = endTime.substring(endTime.indexOf("[")+1,endTime.lastIndexOf("|"));
                    dateAdd = endTime.substring(endTime.indexOf("|")+1,endTime.lastIndexOf("]"));
                    endTime = stt;
                }
                endTime = this.cds.currRecord.data[endTime];
                endTime = endTime.replace(new RegExp("\\-",'g'),"/"); 
                if(dateAdd !=""){
                    let add = dateAdd.split(";");
                    add.unshift(endTime);
                    endTime = baseTool.dateAdd(add);
                } 
                let ed = new Date(endTime);
                if(ed.getTime()>=time.getTime()){
                    return false;
                }else{
                    return true;
                }
            }
        }
        return false;
    }

    dataChange(value:string|number|Array<any>){
        let vl:any = "";
        if(value instanceof Array){
            vl = value[0]+"~"+value[1];
        }else{
            vl = value;
        }
        value = vl;
        if(this.cds&&this.cell){
            if(this.cds.currCanEdit()){
                this.cds.setStateOrAnd(icl.R_EDITED)
                if(value==null){
                    this.model1 = ''
                    this.cds.currRecord.data[this.cell.id] = this.model1
                    this.cds.currRecord = Object.assign({},this.cds.currRecord)
                    this.cds.cdata.data[this.cds.index] = this.cds.currRecord
                }else{
                    if(value != this.model){
                        // this.model1 = value
                        //TODO 公式关联
                        this.cds.currRecord.data[this.cell.id] = value
                        this.cds.currRecord = Object.assign({},this.cds.currRecord)
                        this.cds.cdata.data[this.cds.index] = Object.assign({},this.cds.currRecord)
                        const key:string = this.cell.id
                        this.$bus.$emit(this.methodName,{cellId:key,value:value,row:this.cds.index})
                        this.cds.checkGS(this.cell)
                        this.model1 = value
                        this.cds.setStateOrAnd(icl.R_EDITED)
                    }
                }
                this.cds.currRecord.c_state |= 2;
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
            }else{
                this.model1 = this.model
            }
        }   
    }
    @Watch("model")
    cdataSetRecordChange(){
        if(this.cds&&this.cell){
            if( this.model1 != this.model){
                this.model1 = this.model
            }
        }
    }
}
</script>
