<template>
<div>
	<div v-if="initOk" class="app-container" >
		<!-- <gantt-elastic :style="{height:height+'px'}" :options="options" :tasks="tasks" @tasks-changed="tasksUpdate" @options-changed="optionsUpdate" @dynamic-style-changed="styleUpdate"> -->
		<gantt-elastic :style="{height:height+'px'}" :options="options" :tasks="tasks" :dynamic-style="dynamicStyle"></gantt-elastic>
	</div>
	<div v-else>
		暂无数据
	</div>
</div>  
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
import GanttElastic from "gantt-elastic";
@Component({
    components: {  GanttElastic }
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
			maxHeight: 230,
			row: {
				height: 16,//设置行高
			},
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
					offset: 4, //*
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
				weekdays:["周日","周一","周二","周三","周四","周五","周六"],
				months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
			},
    	};
		_options.taskList.columns = this.config.columns
		if(this.config.maxHeight){
			_options.maxHeight = this.config.maxHeight
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
