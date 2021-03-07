<template>
<div>
	<div v-if="config && config.data.length>0" class="app-container" >
		<div :ref="ganttID" :style="{height:height+'px'}"/>
	</div>
	<div v-else>
		暂无数据
	</div>
</div>  
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
import _gantt from 'dhtmlx-gantt'  // 引入模块

import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
@Component
// 文档： https://docs.dhtmlx.com/gantt/
export default class BipGant extends Vue{
	@Prop() config!:any;
	@Prop() height!:any;
	ganttID:any = this.guid();
	gantt:any = _gantt
	mounted(){
		if(this.config){
			this.initGt();
		}
		this.gantt.locale={
			date: {
				month_full: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
				month_short: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
				day_full: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
				day_short: ["日", "一", "二", "三", "四", "五", "六"]
			},
			labels: {
				dhx_cal_today_button: "今天",
				day_tab: "日",
				week_tab: "周",
				month_tab: "月",
				new_event: "新建日程",
				icon_save: "保存",
				icon_cancel: "关闭",
				icon_details: "详细",
				icon_edit: "编辑",
				icon_delete: "删除",
				confirm_closing: "请确认是否撤销修改!", //Your changes will be lost, are your sure?
				confirm_deleting: "是否删除日程?",
				section_description: "描述",
				section_time: "时间范围",
				section_type: "类型",

				/* grid columns */

				column_text: "任务名",
				column_start_date: "开始时间",
				column_duration: "持续时间",
				column_add: "",

				/* link confirmation */

				link: "关联",
				confirm_link_deleting: "将被删除",
				link_start: " (开始)",
				link_end: " (结束)",

				type_task: "任务",
				type_project: "项目",
				type_milestone: "里程碑",

				minutes: "分钟",
				hours: "小时",
				days: "天",
				weeks: "周",
				months: "月",
				years: "年"
			}
		};
	}
	@Watch('config',{deep:true})
	configChange(val:any){
		if(this.config){
			this.initGt()
		}
	}
	initGt(){
		let _this:any =this;
		this.gantt.clearAll(); 
		this.gantt.config.columns = this.config.columns
		if(this.config.date_format)
			this.gantt.config.date_format = this.config.date_format;
		this.gantt.config.readonly = this.config.readonly;
		if(this.config.grid_width)
			this.gantt.config.grid_width = this.config.grid_width;
		// several scales at once
		this.gantt.config.scales = [
			{unit: "month", step: 1, format: "%Y,%F"},
		];
		this.gantt.attachEvent("onTaskClick", function(id:any, e:any) {
			_this.$emit("onTaskClick",id)
			this.gantt.selectTask(id); 
		});
		// 初始化
		this.gantt.init(this.$refs[this.ganttID])
		// 数据解析
		this.gantt.parse(this.config)
	}
	guid():string {
		return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
	}
	S4() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1)+'';
	}
}
</script>
<style scope>

</style>
