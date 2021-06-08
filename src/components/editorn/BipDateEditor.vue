<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="dateTime">
            <template v-if="!bgrid">
                <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                    <span slot="label" v-if="cell.labelString">
                        <template v-if="cell.labelString.length>(cell.isReq?4:6)">
                            <el-tooltip class="item" effect="dark" :content="cell.labelString" placement="top">
                                <span>{{cell.labelString.substring(0,(cell.isReq?4:5))}}…</span>
                            </el-tooltip>
                        </template>
                        <template v-else>
                            {{cell.labelString}}
                        </template>
                    </span>                     
                    <template v-if="condition"><!-- 报表条件 -->
                        <template v-if="dateType != 'week'">
                            <el-date-picker size="medium" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                                v-model="model1"
                                @focus='focus'
                                :picker-options="pickerOptions"
                                :type="dateType"
                                range-separator="~"
                                :format="showFormat"
                                :value-format="dateFormat"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                placeholder="选择日期" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                            </el-date-picker>
                        </template>
                        <template v-else>
                            <el-row>
                                <el-date-picker size="medium" ref="dateWeek" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                                    v-model="weekModel"
                                    @focus='focus'
                                    @blur='weekInput2Blur'
                                    :type="dateType"
                                    :format="showFormat"
                                    :value-format="dateFormat"
                                    :picker-options="optionaIint"
                                    placeholder="选择日期" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                                </el-date-picker>
                                <el-input v-if="weekInput1Show" size="medium" :style="cell.desc?'width: calc(100% - 29px);position: absolute;left: 0px;':'width:100%;position: absolute;left: 0px;'"
                                    placeholder="选择日期" @focus="weekInput1Focus" v-model="weekInputModel"
                                    prefix-icon="el-icon-date">
                                </el-input>
                            </el-row>
                        </template>
                    </template>
                    <template v-else>
                        <el-date-picker size="medium" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'" class="el-input-group"
                            v-model="model1"
                            @focus='focus'
                            :type="dateType"
                            :format="showFormat"
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
                <el-date-picker size="medium" style="width:100%"
                    v-model="model1"
                    @focus='focus'
                    :type="dateType"
                    :format="showFormat"
                    :value-format="dateFormat"
                    :picker-options="optionaIint"
                    placeholder="选择日期" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                </el-date-picker>
            </template>
        </template>
        <template v-else>
            <template v-if="!bgrid">
                <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                    <span slot="label" v-if="cell.labelString">
                        <template v-if="cell.labelString.length>(cell.isReq?4:6)">
                            <el-tooltip class="item" effect="dark" :content="cell.labelString" placement="top">
                                <span>{{cell.labelString.substring(0,(cell.isReq?4:5))}}…</span>
                            </el-tooltip>
                        </template>
                        <template v-else>
                            {{cell.labelString}}
                        </template>
                    </span>                     
                    <template v-if="condition"><!-- 报表条件 -->
                        <el-time-picker size="medium" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                            v-model="model1"
                            @focus='focus'
                            :picker-options="pickerOptions"
                            range-separator="~"
                            :format="showFormat"
                            :value-format="dateFormat"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            placeholder="选择时间" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                            </el-time-picker>
                    </template>
                    <template v-else>
                        <el-time-picker size="medium" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                            v-model="model1"
                            @focus='focus'
                            :format="showFormat"
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
                <el-time-picker size="medium" style="width:100%"
                    v-model="model1"
                    @focus='focus'
                    :format="showFormat"
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
import moment from 'moment' //引入js日期处理类库
@Component({})
export default class BipDateEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() row!:number
    model1:any = ''
    clearable:boolean = true
    dateType="date"
    dateFormat="yyyy-MM-dd"
    showFormat:any= null
    methodName:string = ''
    condition:boolean = false;
    span:number = 6
    pickerOptions:any = null;
    optionaIint:any = null;
    dateTime:boolean = true;
    
    weekModel:any = null;//周选择器绑定值
    weekInput1Show:boolean = true;//周选择器上层input是否显示
    weekInputModel:any=null;//周选择器上层input显示内容
    mounted(){
        this.condition = (this.cds.ccells.attr&0x80)>0
        if((this.cell.attr&0x400000)>0){
            this.condition = false;
        }
        this.model1 = this.model
        if(this.condition){//报表条件
            if(this.model && this.model.indexOf("~") == -1){
                this.dataChange([this.model,this.model])
            }
        }
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        // if(this.cds&&this.cell){
            if(this.cell.editName == 'DATE_WEEK'){
                this.dateType = "week"
                if(this.cell.initValue){
                    this.weekModel = moment().format('YYYY-MM-DD');  
                    this.weekInput2Blur();
                }
            }else if(this.cell.type<=12 && this.cell.editName =='Y'){
                this.dateType = 'year'
                this.dateFormat = 'yyyy';
            }else if(this.cell.type<=12 && this.cell.editName =='M'){
                this.dateType = 'month'
                this.dateFormat = 'MM';
            }else if(this.cell.type===93){
                this.dateType = 'datetime'
                this.dateFormat = 'yyyy-MM-dd HH:mm:ss'
                if(!this.bgrid && this.condition)
                    this.dateType = "datetimerange";
            }else if(this.cell.type===91){
                this.dateType = 'date'
                this.dateFormat = 'yyyy-MM-dd'
                if(!this.bgrid && this.condition)
                    this.dateType = "daterange";
            }else if(this.cell.editName == 'YM'){
                this.dateType = 'month';
                this.dateFormat = 'yyyyMM'
                if(!this.bgrid && this.condition)
                    this.dateType = "monthrange";
            }else if(this.bipInsAid.bType == 'CHSMEditor'){
                this.dateTime = false;
                if(this.bipInsAid.id == 'HS'){
                    this.dateFormat = 'HHmm';
                    this.showFormat = 'HH:mm'
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
            if(!this.showFormat){
                this.showFormat = this.dateFormat;
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
            }],
            firstDayOfWeek:1
        }
        this.optionaIint={
            disabledDate: (time:any) => {
                return this.optionalInterval(time)
            },
            firstDayOfWeek:1
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
                    this.cds.checkGS(this.cell)
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

    focus(){
        this.$emit("focus",{})
    }
    //周选择中的上层input获取焦点事件
    weekInput1Focus(){
        this.weekInput1Show = false;
        let ref:any = this.$refs.dateWeek;
        ref.focus();
    }
    //周选择中的下层input失去焦点事件
    weekInput2Blur(){
        let showVl = this.weekModel
        let refV = this.cell.refValue;
        let date = moment(showVl);
        let startDate:any = date.week(date.week()).startOf('week').format('YYYY-MM-DD');   //这样是年月日的格式
        startDate = moment(startDate).add(1, 'd').format('YYYY-MM-DD');
        let endDate:any = date.week(date.week()).endOf('week').format('YYYY-MM-DD'); //这样是时间戳的格式 
        endDate = moment(endDate).add(1, 'd').format('YYYY-MM-DD');
        date = moment(startDate);
        date = date.add(1, 'd');
        this.model1 = startDate+"~"+endDate
        if(refV){
            if(refV.indexOf('M_W') == 0){
                var date1 = new Date(showVl), 
                w = date1.getDay(),
                d = date1.getDate();
                let weekMonth = Math.ceil((d + 6 - w) / 7);
                let month = date.month()+1;
                showVl = month+"月第"+weekMonth+"周";
            }else if(refV.indexOf('Y_W') == 0){
                let year = date.year()
                let weekYear =  date.week();
                showVl = year+"年第"+weekYear+"周";
            }
        }else{
            showVl = this.model1;
        }
        this.weekInputModel = showVl;
        this.weekInput1Show = true;
        this.dataChange([startDate,endDate])
    }

    @Watch("model")
    cdataSetRecordChange(){
        if(this.model != 'Invalid date'){
            if(this.cds&&this.cell){
                if( this.model1 != this.model){
                    this.model1 = this.model
                    if(this.showFormat =='HH:mm' && this.dateFormat=='HHmm'){
                        if(this.model1.length ==1){
                            this.model1 = "000"+this.model1
                        }else if(this.model1.length ==2){
                            this.model1 = "00"+this.model1
                        }else if(this.model1.length ==3){
                            this.model1 = "0"+this.model1
                        }
                    }
                }
            }
        }
    }
}
</script>
