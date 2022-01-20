<template>
<div>
	<!-- <button @click="makeImg">导出图片</button> -->
	<div v-if="initOk" class="app-container" >
		<!-- <gantt-elastic :style="{height:height+'px'}" :options="options" :tasks="tasks" @tasks-changed="tasksUpdate" @options-changed="optionsUpdate" @dynamic-style-changed="styleUpdate"> -->
		<gantt-elastic :options="options" :tasks="tasks" :dynamic-style="dynamicStyle" id="gantt_elastic" style="width: max-content;" >
			   <!-- <gantt-header class="gantt" :options="options" slot="header"></gantt-header> -->
		</gantt-elastic>
		<!-- <gantt-elastic style="width: max-content;" id="gantt_elastic" :options="options" :tasks="tasks">
		</gantt-elastic> -->
	</div>
	<div v-else>
		暂无数据
	</div>
</div>  
</template>
<script lang="ts">
/**
 * 甘特图组件
 */
import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
import GanttElastic from "gantt-elastic";
import GanttHeader from "gantt-elastic-header";
import domtoimage from 'dom-to-image';
@Component({
    components: {  GanttElastic ,GanttHeader}
})
export default class BipGant extends Vue{
	@Prop() config!:any;
	@Prop() height!:any;
	ganttID:any = this.guid();
	options:any = null
	tasks:any = [];
	initOk:boolean = false;
	dynamicStyle:any={};
	mounted(){
		if(this.config){
			this.initGt()
		}
	}
	@Watch('config',{deep:true})
	configChange(val:any){
		if(this.config){
			this.initGt()
		}
	}
	initGt(){
		this.initOk = false
		let _options = {
			taskMapping: {
				progress: "percent"
			},
			maxHeight: 230*10,
			row: {
				height: 15,//设置行高
			},
			height:this.height*10,
			times: {
				timeScale: 24 * 60 * 1000,
			},
			chart: {
				grid: {
					horizontal: {
						gap: 6 ,//*
					}
				},
				text: {
					offset: -188, //*
					xPadding: 10, //*
					display: true //*
				},
				expander: {
					type: 'chart',
					display: true, //*
					displayIfTaskListHidden: true, //*
					offset: 4, //*
					size: 18   
				}
			},
			taskList: {
				columns: [],
				display: true
			},
			calendar: {
				workingDays: [1, 2, 3, 4, 5,6], 
				gap: 0, 
				strokeWidth: 5,
				hour: {
					display: false
				},
			},
			locale: {
				name: "en",
				Now: "当前时间",
				"X-Scale": "宽",
				"Y-Scale": "高",
				"Task list width": "列头宽度",
				"Before/After": "时间跨度",
				"Display task list": "显示列头",
				weekdays:["周日","周一","周二","周三","周四","周五","周六"],
				months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
			},
    	};
		_options.taskList.columns = this.config.columns
		if(this.config.maxHeight){
			_options.maxHeight = this.config.maxHeight
		}
		if(this.config.chart){
			_options.chart = this.config.chart
		}
		this.tasks=  this.config.data;
		let maxTime = 0
		let minTime = 0
		for(var i=0;i<this.tasks.length;i++){
			let tk = this.tasks[i];
			let t = tk.start
			let _t = t+tk.duration;
			if(minTime ==0)
				minTime = t;
			if(_t>maxTime)
				maxTime = _t;
			if(t<minTime)
				minTime = t;
		}
		let timeC = maxTime - minTime;
		let moNum = parseInt((timeC/1000/60/60/24/31)+'');
		if(moNum >0)
			_options.times.timeScale = (moNum ) * 60 * 1000;
		else
			_options.times.timeScale = 60 * 1000;
		this.options = _options
		this.dynamicStyle = this.config.dynamicStyle
		this.initOk = true;
	}
	guid():string {
		return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
	}
	S4() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1)+'';
	}
	makeImg(){
        let _this = this; 
        try{
            // console.log("开始导出图片！")  gantt-elastic__main-view document.getElementById('gantt_elastic') 
            domtoimage.toBlob(document.getElementById('gantt_elastic')).then(function (data:any) {
                let blob = new Blob([data], {
                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
                });
                let date = new Date()
                var url = window.URL.createObjectURL(blob); 
                var a = document.createElement('a');
                a.href = url;
                a.download = date+'gantt_elastic.png';
                a.click(); 
            })
            .catch(function (error:any) {
                _this.$notify.error("图片获取失败！");
            });
        }catch(e){
            this.$notify.error("图片获取失败！");
        } 
    }
}
</script>
<style lang="scss">
#diagonalHatch{
	.chart-row-progress-bar-line{
		stroke: #2dd36c !important;
		stroke-width: 62px !important;
	}
}
</style>

<style scoped>
.gantt-elastic__header{
	padding: 0px;
}
.gantt >>> .gantt-elastic__header-btn-recenter {
  font-size: 14px !important;
  background-color: #ffffff !important;
  color: #606266 !important;
  border: 1px solid #dcdfe6 !important;
  padding: 5px 10px !important;
  display: none;
}
.gantt >>> .gantt-elastic__header-btn-recenter:hover {
  background-color: #ecf5ff !important;
  border: 1px solid #b6d8fa !important;
}
.gantt >>> .gantt-elastic__header-title {
  display: none;
}
.gantt >>> .gantt-elastic__header-label {
  font-size: 16px;
  color: #303133;
}
.gantt >>> .gantt-elastic__header-task-list-switch--wrapper {
  font-size: 16px;
  color: #303133;
  display: none;
}
.gantt >>> .vue-switcher-theme--default.vue-switcher-color--default div {
  background-color: #409eff;
}
.gantt >>> .vue-switcher-theme--default.vue-switcher-color--default.vue-switcher--unchecked
  div {
  background-color: #dcdfe6;
}
.gantt >>> .vue-switcher-theme--default.vue-switcher-color--default div:after {
  background-color: #fff;
  box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
}
</style>