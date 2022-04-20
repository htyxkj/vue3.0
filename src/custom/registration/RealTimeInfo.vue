<template>
    <div v-loading="loading" class="back-color">
        <el-scrollbar wrap-class="scrollbar-wrapper" :style="style">
            <div class="panel">
                <div class="panel-item" v-for="(item,index) in listData" :key="index" >
                    <div class="title">{{item.title}}</div>
                    <div class="circle-panel">
                        <div class="item-left">
                            <div class="endtime">报名截止时间 : {{item.eddate}}</div>
                            <div class="upper">报名上限 ：{{item.qty_people}}</div>
                            <div class="number">已报人数 ：{{item.qty}}</div>
                        </div>
                        <div class="item-right">
                             <el-progress type="circle" :percentage="item.proportion" :width="80"></el-progress>
                        </div>
                    </div>
                    <div class="nav">
                        <span class="nav-details" @click="timeInfoClick(item)">查看详情>></span>
                        <span @click="signUp_1(item)">报名>></span>
                    </div>
                </div>
            </div>

            <!-- <el-row >
                <el-col :span="8" v-for="(item,index) in listData" :key="index" >
                    <div class="one-card" @click="timeInfoClick(item)">
                        <el-row class="title">
                            <h3>{{item.title}}</h3>
                        </el-row>
                        <el-row class="time">报名截止时间:{{item.eddate}}</el-row>
                        <el-row>
                            <el-col :span="16">
                                <el-row class="num">报名上限：{{item.qty_people}}</el-row>
                                <el-row class="num">已报人数：{{item.qty}}</el-row>
                            </el-col>
                            <el-col :span="8">
                                <el-progress type="circle" :percentage="item.proportion" :width="80"></el-progress>
                            </el-col>
                        </el-row>
                    </div>
                </el-col> 
            </el-row> -->

        </el-scrollbar>

        <el-dialog class="real-time-info-dialog" destroy-on-close :visible.sync="showInfo" width="60%" :show-close="false" top="10vh" :close-on-click-modal="false">
            <span slot="title"></span>
            <el-scrollbar wrap-class="scrollbar-wrapper" style="height:65vh">
                <div v-html="timeInfoMsg"></div>
            </el-scrollbar>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showInfo = false" size="mini" >取 消</el-button>
                <el-button type="primary" @click="signUp" size="mini">报 名</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue , Watch } from "vue-property-decorator";
import {  State } from 'vuex-class';
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
@Component({

})
/**
 * 资讯页面
 */
export default class RealTimeInfo extends Vue{
    @State('bipComHeight', { namespace: 'login' }) bipHeight!: number;
    style:any="";
    listData:any=[];
    showInfo:boolean = false;
    timeInfoMsg:any = "";
    selItem:any = null;

    insaid:any="RTLIST";
    insaid_item:any="RTITEMMSG";

    loading:boolean = false;

    async created(){
        this.loading = true;
        this.initdata();
    }
    async mounted(){
        this.initHeight();
    }
    async initdata(){
        let qe:QueryEntity = new QueryEntity('','');
        qe.page.currPage = 1;
        qe.page.pageSize = 500;
        let vv = await BIPUtil.ServApi.getBipInsAidInfo(this.insaid,210 ,qe);
        if(vv.data.id ==0){
            this.listData = vv.data.data.data.values;
        }
        this.loading = false;
    }
    //报名
    signUp(){
        this.showInfo = false;
        let params = this.selItem;
        params.pmenuid = "S3035"
        this.$router.push({
            path:'/GroupRegistration',
            name:'GroupRegistration',
            query: params,
        })
    }
    // 报名-1
    signUp_1(item:any){
        this.selItem = item;
        let params = this.selItem;
        params.pmenuid = "S3035"
        this.$router.push({
            path:'/GroupRegistration',
            name:'GroupRegistration',
            query: params,
        })
    }
    async timeInfoClick(item:any){
        this.loading = true;
        this.selItem = item;
        let qe:QueryEntity = new QueryEntity('','');
        qe.page.currPage = 1;
        qe.page.pageSize = 1;
        let allCont = [];
        let oneCont = []; 
        let qCont = new QueryCont('sid',item.sid,12);
        oneCont.push(qCont);
        if(oneCont.length !=0){
            allCont.push(oneCont);
            qe.cont = "~" + JSON.stringify(allCont); 
        }else{
            qe.cont = "";
        }
        let vv = await BIPUtil.ServApi.getBipInsAidInfo(this.insaid_item,210 ,qe);
        if(vv.data.id ==0){
            let vls = vv.data.data.data.values;
            this.timeInfoMsg = vls[0].content;
            this.showInfo = true;
        }
        this.loading = false;
    }
    @Watch("bipHeight")
    initHeight(){
        if(this.bipHeight){
            this.style = "height:"+(this.bipHeight+5)+"px"
        }
    }
}
</script>
<style lang="scss" scoped>
.one-card{
    min-height: 3.15rem;
    padding: .2188rem;
    margin: 0.125rem;
    border: 1px solid #eee;
    // .time{
    //     padding-bottom: .1563rem;
    // }
    // .num{
    //     padding-top: .0781rem;
    // }
}
</style>
<style  lang="scss"  >
.back-color {
    background-color: rgb(245, 247, 250);
}
.panel {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    // color: rgba(0,0,0,.85);
    .panel-item {
        margin-top: 20px;
        padding: 10px 20px 0px 20px;
        width: 24%;
        box-sizing: border-box;
        border-radius: 2px;
        background-color: #fff;
        .title {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            height: .5rem;
            line-height: .5rem;
            font-size: 18px;
        }
        .endtime,.upper,.number {
            width: 100%;
            height: .4rem;
            line-height: .4rem;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .circle-panel {
            display: flex;
        }
        .circle-panel .item-left {
            width: 60%;
             border-bottom: 1px solid #f0f0f0;
        }
         .circle-panel .item-right {
            width: 40%;
            text-align: center;
            position:relative;
            height: 1.2rem;
             border-bottom: 1px solid #f0f0f0;
        }
        .el-progress {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
        }
        .nav {
            height: .35rem;
            line-height: .35rem;
            text-align: right;
            color: rgba(0,0,0,.45);
        }
        .nav-details {
            padding-right: 20px;
        }
    }
}

.real-time-info-dialog{
    .el-dialog__header{
        padding: 0px !important;
    }
    .el-dialog__body{
        padding: 6px 12px;
    }
    .el-scrollbar__wrap{
        overflow-x: hidden;
    }
}
</style>