<template>
	<div class="card">
		<div class="loop-pie">
			<div class="loop-pie-line loop-pie-r">
				<div class="loop-pie-c loop-pie-rm" id="loop-rc" :style="PercentRc"></div>
			</div>
			<div class="loop-pie-line loop-pie-l">
				<div class="loop-pie-c loop-pie-lm" id="loop-lc" :style="PercentLc"></div>
			</div>
		</div>
		<div class="text">{{percentage}}%</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"

@Component({
})
export default class Progress extends Vue{
	@Prop() percentage!:any;
	mounted(){
	}
	get PercentLc(){
		let p = this.percentage ? this.percentage : 0
		var rotate = (p / 100) * 360
		var rotateLeft = 0
		if (rotate < 180) {
		} else {
			rotateLeft = (rotate - 180 - 45)
			return "-webkit-transform:" +"rotate(" + rotateLeft + "deg)";
		}
	}
	get PercentRc(){
		let p = this.percentage ? this.percentage : 0
		var rotate = (p / 100) * 360
		var rotateRight = 0
		if (rotate < 180) {
			rotateRight = rotate + (-45)
		} else {
			rotateRight = 135
		}
		return "-webkit-transform:"+ "rotate(" + rotateRight + "deg)";
	}
}
</script>
<style scoped>
* {
	margin:0px;
	padding:0px;
}
.card{
	position: relative;
	padding-top: .1rem;
}
.text{
	position: absolute;
    width: 1.6rem;
    height: 1.6rem;
    margin: 0px;
    text-align: center;
    line-height: 1.6rem;
    font-size: .35rem;
}
.loop-pie {
	position:absolute;
	width:1.6rem;
	height:1.6rem;
	margin:0px;
}
.loop-pie-line {
	position:absolute;
	width:50%;
	height:100%;
	top:0;
	overflow:hidden;
}
.loop-pie-l {
	top:0px;
	left:0px;
}
.loop-pie-r {
	top:0px;
	-webkit-transform:rotate(180deg);
	right:0px
}
.loop-pie-c {
	width:200%;
	height:100%;
	border:8px solid transparent;
	border-radius:50%;
	position:absolute;
	box-sizing:border-box;
	top:0;
	-webkit-transform:rotate(-45deg);
}
.loop-pie-rm {
	border-top:8px solid #0A263B;
	border-left:8px solid #0A263B;
	border-bottom:8px solid #1fd8ee;
	border-right:8px solid #1fd8ee;
}
.loop-pie-lm {
	border-top:8px solid #0A263B;
	border-left:8px solid #0A263B;
	border-bottom:8px solid #1fd8ee;
	border-right:8px solid #1fd8ee;
}
</style>