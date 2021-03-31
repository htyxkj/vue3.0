<template>
	<div class="card">
		<template v-if="item">
		<div class="head"><span>{{item.name}}</span></div>
		<div class="info">
			<table>
				<tr>
					<td>
						<div class="staff-cust-time"><span class="label-name">预计营收(亿)</span><br><span
								class="label-value">{{item.yjrmb}}</span></div>
					</td>
					<td>
						<div class="staff-cust-time"><span class="label-name">实际营收(亿)</span><br><span
								class="label-value"> {{item.sjrmb}}</span></div>
					</td>
					<td style="width: 20%;">
						<div class="staff-cust-time"><span class="label-name">完成比%</span><br><span
								class="label-value">{{percent1}}</span></div>
					</td>
					<!-- <td style="width: 12%;">
						<div class="staff-cust-time"><span class="label-name">排名</span><br><span
								style="color:#00A8FE;font-size:18px;font-weight:600;">1</span></div>
					</td> -->
				</tr>
			</table>
			<el-avatar size="small" :style="pm1<=3?'background-color: goldenrod':'background-color: blue'">{{pm1}}</el-avatar>
		</div>
		
		<div class="info">
			<table>
				<tr>
					<td>
						<div class="staff-cust-time"><span class="label-name">预计利润(亿)</span><br><span
								class="label-value">{{item.yjfcy}}</span></div>
					</td>
					<td>
						<div class="staff-cust-time"><span class="label-name">实际利润(亿)</span><br><span
								class="label-value">{{item.sjfcy}}</span></div>
					</td>
					<td style="width: 20%;">
						<div class="staff-cust-time"><span class="label-name">完成比%</span><br><span
								class="label-value">{{percent2}}</span></div>
					</td>
					<!-- <td style="width: 12%;">
						<div class="staff-cust-time"><span class="label-name">排名</span><br><span
								style="color:#00A8FE;font-size:18px;font-weight:600;">1</span></div>
					</td> -->
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
		font-size: 1.17em;
		margin-block-start: 0.8em;
		margin-block-end: 0.2em;
		font-weight: bold;
		text-align: center;
	}

	.card .info{
		margin:10px 0;
		border-radius: 5px;
	}

	.info .el-avatar--small{
		background-color: goldenrod;
		position: absolute;
		margin-top: -66px;
	}

	.staff-cust-time {
		height: 4em;
		line-height: 2em;
		/* vertical-align: middle; */
		text-align: center;
		color: #fff;
		/* background: #22284A; */
		background: rgb(230 236 255 / 10%);
		border-radius: 6px;
		/* padding: 2px 2px; */
	}
	.staff-cust-time .label-name{
		font-weight: 300;
		font-size:0.5em;
	}
	.staff-cust-time .label-value{
		font-weight: 300;
		font-size: 1em;
		color:#00A8FE;
		/* font-weight:600; */
	}
	.card table {
		width: 100%;
	}

	.card td {
		width: 33.333%;
	}
</style>
