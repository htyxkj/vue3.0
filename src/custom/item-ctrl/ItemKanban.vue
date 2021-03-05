<template>
    <div>
        <vxe-table ref="itemKanbanTask" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
        show-header-overflow highlight-current-row class="vxe-table-element checkbox-table"
        :data.sync="bipInsAid.values" height='300' :optimized="true">
        <vxe-table-column type="seq" width="60" fixed="left"></vxe-table-column>
            <template v-for="(item,index) in bipInsAid.showColsIndex">
                <vxe-table-column :key="index" header-align="center" align="center" :field="bipInsAid.cells.cels[item].id"
                   :title="bipInsAid.cells.cels[item].labelString" show-header-overflow  show-overflow >
                </vxe-table-column> 
            </template>
            <vxe-table-column header-align="center" align="center" title="完成情况" show-header-overflow  show-overflow >
                <template v-slot="{row}"> 
                    <progress-bar class="progress" offsetParent="body" width="80%" :pointNum="100" :percent="row.sjrate" :canDrag="false"></progress-bar>
                </template>
            </vxe-table-column> 
        </vxe-table>

        <!-- <BipGant :config="gttConfig"></BipGant> -->
    </div>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import BipInsAidNew from '@/classes/BipInsAidNew';
//甘特图
// import ItemMovement from 'gantt-schedule-timeline-calendar/dist/ItemMovement.plugin.js';
// import Selection from 'gantt-schedule-timeline-calendar/dist/Selection.plugin.js';
// import WeekendHighlight from 'gantt-schedule-timeline-calendar/dist/WeekendHighlight.plugin.js';
// import ItemHold from 'gantt-schedule-timeline-calendar/dist/ItemHold.plugin.js';
import BipGant from '@/components/chart/BipGant.vue';
import ProgressBar from "@/components/progressBar/ProgressBar.vue"
@Component({
    components: {
        BipGant,
        ProgressBar
    }
})
export default class ItemKanban extends Vue{
    bipInsAid:BipInsAidNew = new BipInsAidNew("")
    gttConfig:any = null;
    created(){
        this.initGanttConfig();
    }
    mounted(){
        this.initItemData();
    }
    async initItemData(){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 500;
        let cc = await tools.getBipInsAidInfo("WEBGETITEM", 200, qe);
        console.log(cc)
        if(cc.data.id ==0){
            let rr = cc.data.data.data;
            if(rr && rr.cells && rr.cells.cels && rr.cells.cels.length>0){
                this.bipInsAid = rr
            }
        }else{
            this.$notify.error("WEBGETITEM ：获取辅助信息失败！");
        }
        cc = await tools.getBipInsAidInfo("WEBGETITEM", 210, qe);
        if(cc.data.id==0){
            this.bipInsAid.values = cc.data.data.data.values;
        }else{
            this.$notify.error("WEBGETITEM ：获取辅助数据失败！");
        }
    }
    /**
     * 初始化甘特图配置
     */
    initGanttConfig(){

    }
    // initGanttData(){
    //     let week = "周日_周一_周二_周三_周四_周五_周六";
    //     let weeksort = "日_一_二_三_四_五_六";
    //     let m = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    //     let ms = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ];
    //     this.gttConfig = {
	//         "height": 500,
    //         "list":{
    //             // 行属性
    //             "rows": {
    //             },
    //             // 列定义
    //             "columns": {
    //                 "percent": 100,
    //                 "resizer": {
    //                     "inRealTime": true
    //                 },
    //                 "data":{
    //                     "id":{
    //                         "id": "id",
    //                         "data": "id",
    //                         "width": 50,
    //                         "header": {
    //                             "content": "序号"
    //                         }
    //                     },
    //                     "sid":{
    //                         "id": "sid",
    //                         "data": "sid",
    //                         "width": 120,
    //                         "expander": true,
    //                         "header": {
    //                             "content": "任务名称"
    //                         }
    //                     }
    //                 }
    //             }
    //         },
    //         "chart":{
    //             "spacing":1,
    //             "time":{
    //                 "from":"",
    //                 "to": "",
    //                 "zoom":18
    //             },
    //             "items":{
    //             }
    //         },
    //         "locale": {
    //             "name": "zh",
    //             "Now": "Now",
    //             "weekdays": week.split('_'),
    //             "weekdaysShort": weeksort.split('_'),
    //             "months": m,
    //             "monthsShort": ms
    //         },
    //         "plugins":[
    //             WeekendHighlight({weekdays: [6, 0],className:'my-days'}),
    //             ItemMovement({
    //                 "moveable": false,
    //                 "ghostNode": false,
    //                 "collisionDetection": true}),
    //             Selection({
    //                 "items": false,
    //                 "rows": false,
    //                 "grid": true,
    //                 "rectStyle": {
    //                     "opacity": '0.0'
    //                 }})
    //         ]
    //     };
    //     this.gttConfig.list.rows = {
    //         "1": {
    //             "sid": "半钢型腔",
    //             "id": 1,
    //             "expanded": false
    //         },
    //         "2": {
    //             "sid": "半钢型腔-基膜加工",
    //             "expanded": false,
    //             "id": 2
    //         }
    //     };
    //     this.gttConfig.chart['items'] = {
    //         "1": {
    //             "id": "1",
    //             "rowId": "2",
    //             "label": "BHW9001:基膜加工",
    //             "time": {
    //                 "start": 1613885000000,
    //                 "end": 1613886600000
    //             },
    //             "style": {
    //                 "background": "#0077C0",
    //                 "borderRadius": "3px"
    //             }
    //         },
    //         "2": {
    //             "id": "2",
    //             "rowId": "2",
    //             "label": "基膜加工",
    //             "time": {
    //                 "start": 1613886600000,
    //                 "end": 1613987600000
    //             },
    //             "style": {
    //                 "background": "#000000",
    //                 "borderRadius": "3px"
    //             }
    //         }
    //     }
    //     this.gttConfig.chart['time'] =  {
    //                                         "from": 1609951800000,//开始时间
    //                                         "to": 1614182400000,//结束时间
    //                                         "zoom": 18
    //                                     };
    //     this.gttConfig.plugins.push(ItemHold({
    //         time: 10,
    //         movementThreshold: 1,
    //         action: this.addListenClick
    //     }))
    // }
    // addListenClick(element: any, data: any) {
    //     console.log(element)
    //     console.log(data)
    // }
}
</script>

<style>
</style>