<template>
	<div class="card">
		<template v-if="item">
		<div class="head"><span style="color:#259ce7;">{{item.name}}</span></div>
		<div class="info">
			<table border="0" cellspacing="0" cellpadding="0">
				<tr>
					<td class="border_right_bottom1">
						<div  class="staff-cust-time">
							<span class="label-name">计划营收(亿)</span><br>
							<span class="label-value">{{item.yjrmb}}</span>
						</div>
					</td>
					<td  class="border_right_bottom2 ">
						<div class="staff-cust-time">
							<span class="label-name">实际营收(亿)</span><br>
							<span class="label-value"> {{item.sjrmb}}</span>
						</div>
					</td>
					<td>
						<div class="staff-cust-time border_bottom">
							<span class="label-name">完成比%</span><br>
							<span class="label-value">{{percent1}}</span>
						</div>
					</td>
				</tr>
			</table>
			<el-avatar size="small" :style="pm1<=3?'background-color: goldenrod':'background-color: blue'">{{pm1}}</el-avatar>
		</div>
		
		<div class="info">
			<table border="0" cellspacing="0" cellpadding="0">
				<tr>
					<td class="border_right_top">
						<div class="staff-cust-time">
							<span class="label-name">计划利润(亿)</span><br>
							<span class="label-value">{{item.yjfcy}}</span>
						</div>
					</td>
					<td class="border_right_top">
						<div class="staff-cust-time">
							<span class="label-name">实际利润(亿)</span><br>
							<span class="label-value">{{item.sjfcy}}</span>
						</div>
					</td>
					<td>
						<div class="staff-cust-time">
							<span class="label-name">完成比%</span><br>
							<span class="label-value">{{percent2}}</span>
						</div>
					</td>
				</tr>
			</table>
			<el-avatar size="small" :style="pm2<=3?'background-color: goldenrod':'background-color: red'">{{pm2}}</el-avatar>
		</div>
		</template>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"

@Component({
})
export default class CardInfo extends Vue{
	@Prop() item!:any;
	mounted(){
	}

	get pm1(){
		if(this.item){
			return this.item.pm1||99;
		}
		
		return 99;
	}

	get pm2(){
		if(this.item){
			return this.item.pm2||99;
		}
		
		return 99;
	}

	get percent1(){
		if(this.item){
			return (this.item.rmbbl*1).toFixed(2)+'%';
		}
		
		return 0.0;
	}

	get percent2(){
		if(this.item){
			return (this.item.fcybl*1).toFixed(2)+'%';
		}
		return 0.0;
	}
}
</script>

<style>
	.card {
		color: #fff;
	}

	.head {
		display: block;
		font-size: .25rem;
		height: .5rem;
		line-height: .5rem;
		font-weight: bold;
		text-align: center;
		color: #259ce7;
	}

	.card .info{
		font-size: .2rem;
		height: 1rem;
		padding: 0 .25rem;
	}

	.info .el-avatar--small{
		background-color: goldenrod;
		position: absolute;
		margin-top: -1rem;
		margin-left: .1rem;
		width: .3rem;
		height: .3rem;
    	line-height: .3rem;
	}
	.info td{
		margin: 0px !important;
		padding: 0px !important;
	}

	.staff-cust-time {
		height: 1rem;
		line-height: 0.5rem;
		text-align: center;
		color: #fff;
	}
	.staff-cust-time .label-name{
		font-size:.2rem;
		font-weight: bold;
		color: #259ce7;
	}
	.staff-cust-time .label-value{
		font-size: .2rem;
		color:#fff;
	}
	.card table {
		width: 100%;
	}
	.card td {
		width: 33.333%;
	}
	.border_right_bottom1{
		background:
			linear-gradient(to left, #259de7a1, #259de7a1) right bottom no-repeat,
			linear-gradient(to left, #259de7a1, #259de7a1) right bottom no-repeat;
		background-size: 1.5rem  1px, 1px .75rem ;
	}
	.border_right_bottom2{
		background:
			linear-gradient(to left, #259de7a1, #259de7a1) right bottom no-repeat,
			linear-gradient(to left, #259de7a1, #259de7a1) right bottom no-repeat;
		background-size: 1500px  1px, 1px .75rem;
	}
	.border_bottom{
		background:
			linear-gradient(to left, #259de7a1, #259de7a1) right bottom no-repeat;
		background-size: 1500px  1px;
	}
	.border_right_top{
		background: linear-gradient(to left, #259de7a1, #259de7a1) right top no-repeat;
  		background-size: 1px .75rem;
	}
</style>
