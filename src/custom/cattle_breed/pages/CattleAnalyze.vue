<template>
    <el-row>
        <el-row>
            <t-map ref="TMap" class="myTMap" :style="mapStyle"></t-map>
        </el-row>
        <el-row class="toolbar titleBackground">
            <div data-v-71867aea="" style="display: inline-block; width: 35%; height: 100%;">
                <span data-v-71867aea="" class="headerText">数字化分析平台</span>
                <div data-v-71867aea="" class="slopingside" style="margin-left: 0px;"></div>
                <div data-v-71867aea="" class="slopingside"></div>
                <div data-v-71867aea="" class="slopingside"></div>
                <div data-v-71867aea="" class="slopingside"></div>
            </div>
            <div  style="display: inline-block; width: 42%; height: 100%;"></div>
            <div  style="display: inline-block; width: 23%; height: 100%;">
                <el-row>
                    <el-col :span="13">
                        <el-row>
                            <el-col :span="12" class="showtime">{{showtime}}</el-col>
                            <el-col :span="12">
                                <el-row class="showweek">{{showweek}}</el-row>
                                <el-row class="showyear">{{showyear}}</el-row>
                            </el-col>
                        </el-row>
                    </el-col>
                    <el-col :span="11">
                        <div class="rightHav" @click="gotoIndex">前往养殖管理平台</div>
                    </el-col>
                </el-row>
            </div>
        </el-row>
        <el-row class="left-box">
            <el-row>
                <el-col :span="24">
                    <h3><i class="iconfont icon-bip-menu"></i>养殖场经营核心指标</h3>
                    <div class="sltx"></div>
                </el-col>
                <el-col :span="24">
                    <el-row>
                        <el-col :span="8">
                            <div ref="rlb" class="left-chart1"></div>
                        </el-col>
                        <el-col :span="8">
                            <div ref="ssl" class="left-chart1"></div>
                        </el-col>
                        <el-col :span="8">
                            <div ref="stl" class="left-chart1"></div>
                        </el-col>
                        <el-col :span="8">
                            <div ref="nmsl" class="left-chart1"></div>
                        </el-col>
                        <el-col :span="8">
                            <div ref="nmcl" class="left-chart1"></div>
                        </el-col>
                        <el-col :span="8">
                            <div ref="cje" class="left-chart1"></div>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <h3><i class="iconfont icon-bip-menu"></i>牛饲养情况统计</h3>
                    <div class="sltx"></div>
                </el-col>
                <el-col :span="24">
                    <el-row class="left-footer-center">
                        <p class="left-footer-center-p1">存栏量</p>
                        <p class="left-footer-center-p2"><span>5000</span>头</p>
                    </el-row>
                </el-col>
                <el-col :span="24">
                    <el-row class="left-footer-footer">
                        <p class="left-footer-footer-p1">死淘数量</p>
                        <p class="left-footer-footer-p2"><span>643</span>头</p>
                    </el-row>
                    <el-row class="left-footer-footer">
                        <p class="left-footer-footer-p1">死淘重量</p>
                        <p class="left-footer-footer-p2"><span>10483.57</span>千克</p>
                    </el-row>
                    <el-row class="left-footer-footer">
                        <p class="left-footer-footer-p1">销售数量</p>
                        <p class="left-footer-footer-p2"><span>5709</span>头</p>
                    </el-row>
                    <el-row class="left-footer-footer">
                        <p class="left-footer-footer-p1">销售重量</p>
                        <p class="left-footer-footer-p2"><span>60483.57</span>千克</p>
                    </el-row>
                    <el-row class="left-footer-footer">
                        <p class="left-footer-footer-p1">当前隔离区</p>
                        <p class="left-footer-footer-p2"><span>20</span>头</p>
                    </el-row>
                    <el-row class="left-footer-footer">
                        <p class="left-footer-footer-p1">以治疗个体</p>
                        <p class="left-footer-footer-p2"><span>15</span>头</p>
                    </el-row>
                </el-col>
            </el-row>
        </el-row>
        <el-row class="right-box">
            <el-row>
                <el-col :span="24">
                    <h3><i class="iconfont icon-bip-menu"></i> 设备预警</h3>
                    <div class="sltx"></div>
                </el-col>
                <el-col>
                    <div class="nodata">
                        栋设4湿度过高，当前湿度为 35.9%/RH
                    </div>
                    <div class="rrtx"></div>
                    <div class="nodata">
                        栋设2温度过高，当前温度为 35.5℃
                    </div>
                    <div class="rrtx"></div>
                    <div class="nodata">
                        栋设12光照度过低，当前光照度为 150Lux
                    </div>
                    <div class="rrtx"></div>
                    <div class="nodata">
                        栋设7二氧化碳含量过高，当前二氧化碳浓度为 1627PPM
                    </div>
                    <div class="rrtx"></div>
                    <div class="nodata"></div>
                    <div class="rrtx"></div>
                </el-col>
            </el-row>
        </el-row>

        <el-dialog class="bipinsaid CattleAnalyze"  :title="videoDialogTitle" :visible.sync="videoDialog" width="50%" center>
            <video width="100%" height="440" controls>
                <source src="movie.mp4" type="video/mp4">
                <source src="movie.ogg" type="video/ogg">
                您的浏览器不支持 HTML5 video 标签。
            </video>
        </el-dialog>
        
        <el-dialog class="bipinsaid CattleAnalyze"  :title="thDialogTitle" :visible.sync="thDialog" width="50%" center>
            <div class="humiture">
                <div v-for="(item,index) in wsdList" :key="index">
                    <h4>{{item.name}}</h4>
                    <div class="humiture-center">
                        <div class="humiture-center-top">
                            <div class="huniture-center-top-div">
                                <p class="huniture-center-top-div-p1">{{item.wd}}</p>
                                <p class="huniture-center-top-div-p2">℃</p>
                            </div>
                            <p class="huniture-center-top-p">温度</p>
                        </div>
                        <div class="humiture-center-top">
                            <div class="huniture-center-top-div">
                                <p class="huniture-center-top-div-p1">{{item.sd}}</p>
                                <p class="huniture-center-top-div-p2">%/RH</p>
                            </div>
                            <p class="huniture-center-top-p">湿度</p>
                        </div>
                        <div class="humiture-center-top">
                            <div class="huniture-center-top-div">
                                <p class="huniture-center-top-div-p1">{{item.yq}}</p>
                                <p class="huniture-center-top-div-p2">%</p>
                            </div>
                            <p class="huniture-center-top-p">氧气</p>
                        </div>
                        <div class="humiture-center-top">
                            <div class="huniture-center-top-div">
                                <p class="huniture-center-top-div-p1">{{item.eyht}}</p>
                                <p class="huniture-center-top-div-p2">PPM</p>
                            </div>
                            <p class="huniture-center-top-p">二氧化碳</p>
                        </div>
                        <div class="humiture-center-top">
                            <div class="huniture-center-top-div">
                                <p class="huniture-center-top-div-p1">{{item.aq}}</p>
                                <p class="huniture-center-top-div-p2">mg/m³</p>
                            </div>
                            <p class="huniture-center-top-p">氨气</p>
                        </div>
                        <div class="humiture-center-top">
                            <div class="huniture-center-top-div">
                                <p class="huniture-center-top-div-p1">{{item.gzd}}</p>
                                <p class="huniture-center-top-div-p2">Lux</p>
                            </div>
                            <p class="huniture-center-top-p">光照度</p>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import echarts from "echarts";
import { T } from "@/components/map/js/TMap";
import tMap from "@/components/map/MyTianMap.vue";
import { Mutation } from 'vuex-class';
@Component({
  components: {tMap}
}) 
export default class FatPigStatistics1 extends Vue {
    @Mutation('isOtherePage', { namespace:'login' }) setIsOtherePage: any;
    mapStyle:any="";
    tMap:any=null;
    w:any = window;
    videoDialog:boolean = false;
    videoDialogTitle:any="";

    
    thDialog:boolean = false;
    thDialogTitle:any="";
    wsdList:any=[];

    showtime:any = '';
    showyear:any='';
    showweek:any='';
    t:any=null;
    created(){
        this.time();
    }
    mounted() {
        let that =this;
        let h = document.documentElement.clientHeight;
        that.mapStyle = "height:"+h+"px"
        if (this.$refs.TMap) {
            let refT: any = this.$refs.TMap;
            refT.removeControl("MapType")
            this.tMap = refT.getMap();
            //添加图层
            this.tMap.addControl(this.w.TMAP_SATELLITE_MAP);
            //移动图层
            this.tMap.removeControl(this.w.TMAP_NORMAL_MAP);
            this.tMap.removeControl(this.w.TMAP_HYBRID_MAP);
            this.tMap.removeControl(this.w.TMAP_TERRAIN_MAP);
            this.tMap.removeControl(this.w.TMAP_TERRAIN_HYBRID_MAP);
            this.tMap.centerAndZoom(new T.LngLat(116.668780,39.642700), 17);
        }
        this.init();
        this.initMap();
        window.onresize = () => {
            return (() => {
                let h = document.documentElement.clientHeight;
                that.mapStyle = "height:"+h+"px"
                setTimeout(() => {
                    that.tMap.checkResize();    
                }, 500);
            })();
        }
        if(this.tMap){
            setTimeout(() => {
                this.tMap.checkResize();
            }, 1000);
        }
    }
    initMap(){
        this.markRealTimeAir("116.667730,39.642060",this.tMap,"jk-栋设一监控",this.mapIconClick,"栋设一监控","1")
        this.markRealTimeAir("116.668180,39.641110",this.tMap,"wsd-环境实时监控-1",this.mapIconClick,"栋设温湿度感应器","2")
        this.markRealTimeAir("116.670530,39.641340",this.tMap,"jk-栋设六监控",this.mapIconClick,"栋设六监控","1")
        this.markRealTimeAir("116.670260,39.642510",this.tMap,"wsd-环境实时监控-4",this.mapIconClick,"栋设温湿度感应器","2")
        this.markRealTimeAir("116.669350,39.643590",this.tMap,"wsd-环境实时监控-7",this.mapIconClick,"栋设温湿度感应器","2")
        this.markRealTimeAir("116.667510,39.643290",this.tMap,"wsd-环境实时监控-10",this.mapIconClick,"栋设温湿度感应器","2")

        
    }
    mapIconClick(data:any){
        let keys = data.target.key
        let key = keys.split("-");
        if(key[0] == 'jk'){
            this.videoDialogTitle = key[1]
            this.videoDialog = true;
        }
        if(key[0] == 'wsd'){
            this.wsdList=[];
            this.thDialogTitle = key[1]
            this.thDialog = true;
            let idx = key[2];
            for(var i=0;i<3;i++){
                let dd:any = {};
                dd.name = "栋设"+(parseInt(idx)+i)
                dd.wd = 24.5;
                dd.sd = 25.9;
                dd.yq = 0.8;
                dd.eyht = 1127.0;
                dd.aq = 0.01
                dd.gzd = 209.0

                if((parseInt(idx)+i) == 4){
                    dd.sd = 35.9
                }
                if((parseInt(idx)+i) == 2){
                    dd.wd = 35.5
                }
                if((parseInt(idx)+i) == 12){
                    dd.gzd = 150
                }
                if((parseInt(idx)+i) == 7){
                    dd.eyht = 1627
                }
                this.wsdList.push(dd);
            }
        }
    }


    async init(){
        let options0 = {
            series: [
                {
                    radius: "90%", //仪表大小
                    type: 'gauge',
                    detail: {
                        offsetCenter: [0, "10%"],
                        color:'#fff',
                        fontSize:15,
                        formatter:'{value}',
                    },
                    title:{
                        offsetCenter: [0, "90%"],
                        fontSize : 15,
                        color:'#fff',
                    },
                    data: [{value: 0, name: '1.83'}],
                    splitNumber:1,
                    pointer:{
                        show :false
                    },
                    axisTick:{
                        show:false,
                    },
                    axisLabel:{
                        show:false  
                    },
                    splitLine:{
                        show:false,
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 10, // 这个是修改宽度的属性
                            color: [
                                [1,new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                    {
                                        offset: 0.1,
                                        color: "#FFC600"
                                    },
                                    {
                                        offset: 0.6,
                                        color: "#30D27C"
                                    },
                                    {
                                        offset: 1,
                                        color: "#0B95FF"
                                    }
                                    ])
                                ]
                            ]
                        }
                    }
                }
            ]
        };

        let rlbOption = Object.assign({},options0);
        rlbOption.series[0].data[0].name="肉料比"
        rlbOption.series[0].data[0].value= 1.83
        let rlb = echarts.init(this.$refs.rlb as HTMLCanvasElement);
        rlb.setOption(rlbOption);

        let sslOption = Object.assign({},options0);
        sslOption.series[0].data[0].name="上市率"
        sslOption.series[0].data[0].value= 80.48
        sslOption.series[0].detail.formatter= '{value}%';
        let ssl = echarts.init(this.$refs.ssl as HTMLCanvasElement);
        ssl.setOption(sslOption);

        let stlOption = Object.assign({},options0);
        stlOption.series[0].data[0].name="死淘率"
        stlOption.series[0].data[0].value= 19.52
        stlOption.series[0].detail.formatter= '{value}%';
        let stl = echarts.init(this.$refs.stl as HTMLCanvasElement);
        stl.setOption(stlOption);

        let nmslOption = Object.assign({},options0);
        nmslOption.series[0].data[0].name="牛苗数量"
        nmslOption.series[0].data[0].value= 3294
        nmslOption.series[0].detail.formatter= '{value}\n头';
        let nmsl = echarts.init(this.$refs.nmsl as HTMLCanvasElement);
        nmsl.setOption(nmslOption);

        let nmclOption = Object.assign({},options0);
        nmclOption.series[0].data[0].name="牛苗出量"
        nmclOption.series[0].data[0].value= 2651
        nmclOption.series[0].detail.formatter= '{value}\n头';
        let nmcl = echarts.init(this.$refs.nmcl as HTMLCanvasElement);
        nmcl.setOption(nmclOption);

        let cjeOption = Object.assign({},options0);
        cjeOption.series[0].data[0].name="成交额"
        cjeOption.series[0].data[0].value= 683.01
        cjeOption.series[0].detail.formatter= '{value}\n万元';
        let cje = echarts.init(this.$refs.cje as HTMLCanvasElement);
        cje.setOption(cjeOption);
    }


     /** 
     * @description   
     * @param lngLat  经纬度信息   xxx,xxx
     * @param tMap    天地图对象
     * @param key     标注点唯一值
     * @param click   点机回调方法
     * @param msg     鼠标悬浮显示内容
     * @param type    类型 1 摄像头  2 温湿度
     * @returns 标注点对象
     * */        
    markRealTimeAir(lngLat:string,tMap:any,key:any,click:any,msg:any="",type:any){
        let zIndexOffset = 10;
        let iconUrl = require('@/assets/cattle_breed/wdj.png')
        if(type=='1'){//摄像头
            iconUrl = require('@/assets/cattle_breed/sxt.png')
        }
        var icon = new T.Icon({
            iconUrl: iconUrl,
            iconSize: new T.Point(100, 100),
            iconAnchor: new T.Point(30, 85)
        });
        var marker = new T.Marker(new T.LngLat(lngLat.split(",")[0], lngLat.split(",")[1]), {icon: icon,zIndexOffset:zIndexOffset});
        //向地图上添加标注
        tMap.addOverLay(marker);
        marker.key = key;
        marker.addEventListener("click",click)
        if(msg.length>0){
            var markerInfoWin = new T.InfoWindow(msg);
            marker.addEventListener("mouseover", function () {
                marker.openInfoWindow(markerInfoWin);
            });// 将标注添加到地图中
        }
        return marker;
    }

    gotoIndex(){
        this.setIsOtherePage(false)
        this.$router.push({
            path:'/',
            name:"Home",
        })
    }

    time() {
        let week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
        clearTimeout(this.t); //清除定时器
        let dt = new Date();
        let y = dt.getFullYear();
        let mt = dt.getMonth() + 1;
        let day = dt.getDate();
        var days = dt.getDay();//星期

        let h: any = dt.getHours(); //获取时
        let m: any = dt.getMinutes(); //获取分
        let s: any = dt.getSeconds(); //获取秒
        if (m < 10) {
        m = "0" + m;
        }
        if (s < 10) {
        s = "0" + s;
        }
        if (h < 10) {
        h = "0" + h;
        }
        this.showyear = y + "-" + mt + "-" + day;
        this.showtime = h + ":" + m + ":" + s;
        this.showweek = week[days]
        this.t = setTimeout(this.time, 1000); //设定定时器，循环运行
    }
}
</script>
<style>
.CattleAnalyze .el-dialog__body {
    padding: 0px 0px;
}
</style>
<style lang="scss" scoped>

.toolbar{
    position: absolute;
    top: 0;
    width: 100%;
    height: 8.3%;
    z-index: 99999;
}
.headerText{
    float: left;
    font-family: PingFangSC-Medium,PingFang SC;
    color: #fff;
    width: 3.5rem;
    font-size: .35rem;
    margin-left: 0.25rem;
    margin-bottom: 0.25rem;
    margin-top: 0.25rem;
    letter-spacing: .125rem
}
.slopingside {
    float: left;
    width: .375rem;
    margin-top: .4375rem;
    margin-left: 0;
    border: 1px solid #fff;
    transform: rotate(125deg);
    -o-transform: rotate(125deg);
    -moz-transform: rotate(125deg);
    -webkit-transform: rotate(125deg);
}

.titleBackground {
    background: linear-gradient(270deg,#001814,#001814 11%,rgba(0,23,20,.05) 23%,rgba(0,22,18,0) 50%,rgba(0,22,17,.05) 77%,#011511 90%,#01140f);
}
.left-box{
    float: left;
    position: fixed;
    left: 0;
    top: 8.3%;
    z-index: 9999;
    width: 23%;
    background: linear-gradient(270deg, rgba(0, 24, 20, 0.04) 0%, rgb(1, 21, 17) 56%, rgb(1, 20, 15) 100%);
    h3{
        margin-left: .075rem;
        height: .25rem;
        line-height: .25rem;
        text-align: left;
        color: #fff;
        font-weight: 500;
        font-size: 16px;
        i{
            font-size: .3rem;
        }
    }
}
.left-chart1{
    height:2.4688rem;
}
.sltx{
    width: 100%;
    height: 1px;
    background: linear-gradient(63deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,.05));
    margin-right: 1.875rem;
}
.rrtx{
    clear: both;
    width: 100%;
    margin: 0;
    height: 1px;
    background: hsla(0,0%,100%,.2);
}
.left-footer-center {
    margin-left: 0.25rem;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
}
.left-footer-center-p1 {
    width: 1.5rem;
    height: .35rem;
    font-size: .25rem;
    font-family: FZLTZHK--GBK1-0,FZLTZHK--GBK1;
    font-weight: 400;
    color: #fff;
    line-height: .35rem;
    background: #ffb702;
    text-align: center;
}
.left-footer-center-p2 {
    margin-top: 0.25rem;
    height: .25rem;
    font-size: .25rem;
    font-family: FZLTXHK--GBK1-0,FZLTXHK--GBK1;
    font-weight: 400;
    color: #fff;
    line-height: .25rem;
    span{
        font-size: .75rem;
        font-family: Impact;
        color: #ffb702;
        line-height: .55rem;
    }
}
.left-footer-footer{
    width: 2.25rem;
    float: left;
    margin-left: 0.25rem;
}
.left-footer-footer-p1{
    width: 1.625rem;
    height: 0.375rem;
    background: rgba(46, 228, 149, 0.2);
    min-width: 37.5px;
    font-size: .25rem;
    font-family: PingFangSC-Medium,PingFang SC;
    font-weight: 500;
    color: #fff;
    line-height: 0.375rem;
    text-align: center;
    margin-bottom: 0 !important;
}
.left-footer-footer-p2 {
    height: .375rem;
    font-size: .175rem;
    font-family: PingFangSC-Regular,PingFang SC;
    font-weight: 400;
    color: hsla(0,0%,100%,.45);
    line-height: .375rem;
    span{
        width: .875rem;
        height: .125rem;
        font-size: .3rem;
        font-family: Impact;
        color: #ffb702;
        line-height: .125rem;
    }
}

.rightHav{
    height: .9375rem;
    font-size: .25rem;
    font-family: PingFangSC-Regular,PingFang SC;
    color: #2ee495;
    text-shadow: 0 0 8px #fff, 0 0 42px #2ee495, 0 0 72px #2ee495, 0 0 150px #2ee495;
    line-height: .9375rem;
}
.right-box{
    width: 23%;
    position: fixed;
    right: 0;
    top: 8.3%;
    height: 91.7%;
    z-index: 999;
    background: -webkit-gradient(linear,left top,right top,from(rgba(0,24,20,.04)),color-stop(56%,#011511),to(#01140f));
    background: linear-gradient(90deg,rgba(0,24,20,.04),#011511 56%,#01140f);
    h3{
        height: .25rem;
        line-height: .25rem;
        text-align: left;
        color: #fff;
        font-weight: 500;
        font-size: 16px;
        i{
            font-size: .3rem;
        }
    }
}
.nodata {
    height: 1rem;
    color: #ff6139;
    line-height: 1rem;
}


.humiture{
    background: -webkit-gradient(linear,left top,left bottom,from(#012322),to(rgba(1,36,35,.8)));
    background: linear-gradient(#012322,rgba(1,36,35,.8));
    border: 1px solid#ffb70200;
    color: #fff;
    h4{
        padding-left: .3125rem;
    }
}
.humiture-center {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    margin: 0.2375rem 0;
}
.humiture-center-top {
    width: 1.6344rem;
    height: 1.6563rem;
    margin-left: .3125rem;
}
.huniture-center-top-div {
    width: 1.25rem;
    height: 1.25rem;
    background-image:url(../../../assets/cattle_breed/ring.png);
    background-size: 100% 100%;
    position: relative;
}
.huniture-center-top-div-p1 {
    width: .8203rem;
    height: .3359rem;
    text-align: center;
    font-size: .25rem;
    font-family: Impact;
    color: #fff;
    line-height: .3359rem;
    position: absolute;
    top: 15%;
    left: 18%;
}
.huniture-center-top-div-p2 {
    width: .7031rem;
    height: .1992rem;
    text-align: center;
    font-size: .15rem;
    font-family: PingFangSC-Regular,PingFang SC;
    font-weight: 400;
    color: hsla(0,0%,100%,.45);
    line-height: .1992rem;
    position: absolute;
    left: 23%;
    top: 50%;
}
.huniture-center-top-p {
    min-width: 60px;
    margin-top: 0.09rem;
    margin-left: 0.225rem;
    width: .9375rem;
    height: .1992rem;
    background: -webkit-gradient(linear,left top,right top,from(rgba(46,228,149,.01)),color-stop(50%,rgba(45,228,150,.75)),to(rgba(46,228,149,0)));
    background: linear-gradient(90deg,rgba(46,228,149,.01),rgba(45,228,150,.75) 50%,rgba(46,228,149,0));
    height: .1992rem;
    font-size: .1rem;
    font-family: PingFangSC-Medium,PingFang SC;
    font-weight: 500;
    color: hsla(0,0%,100%,.75);
    line-height: .1992rem;
    text-align: center;
}
.myTMap {
    width: 100%;
    outline: none;
}
.nowTime{
    color: #fff;
}
.showweek{
    color: rgba(255, 255, 255, 0.75); 
    height: .4688rem;
    line-height: .70314rem;
    font-size: 0.175rem; 
    margin: 0px; 
    padding: 0px;
}
.showtime{
    color: rgba(255, 255, 255, 0.75); 
    height: .9375rem; 
    line-height: .9375rem; 
    font-size: .35rem;
}
.showyear{
    color: rgba(255, 255, 255, 0.75);
    height: .4688rem;
    font-size: 0.175rem;
    margin: 0px;
    padding: 0px;
}
</style>