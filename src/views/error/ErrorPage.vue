<template>
  	<div class="errorpPage-wrap">
		<div class="errorpPage-box">
			<div class="errorpPage-img">
				<img src="../../assets/bip/error.jpg">
			</div>
			<div class="errorpPage-tip">
				<h3>请稍后再试，请联系管理员！</h3>
			</div>
			<div class="errorpPage-operate">
				<a href="/index">
					<span class="glyphicon glyphicon-home"></span>返回首页
				</a>
			</div>

		</div>
	</div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
@Component({})
export default class Error extends Vue {
  @Mutation("isOtherePage", { namespace: "login" }) setIsOtherePage: any;
  created() {
    console.log("errorPage");
    this.setIsOtherePage(true);
  }
  mounted() {}
}
</script>

<style scoped>
* {
	margin: 0;
	padding: 0;
	font-family: "微软雅黑";
	color: #34495e;
}

.errorpPage-wrap,body {
	width: 100%;
	height: 100%;
}

.errorpPage-box {
	width: 800px;
	height: 400px;
	position: absolute;
	top: 50%;
	margin-top: -200px;
	left: 50%;
	margin-left: -400px;
}

.errorpPage-tip h3 {
	font-size: 24px;
	font-weight: 300;
	margin-top: 20px;
	margin-bottom: 10px;
}

.errorpPage-tip p {
	margin: 20px 0;
}

.errorpPage-operate a {
	margin-left: 10px;
	color: #06F;
	text-decoration: none;
}

.errorpPage-operate a:first-child {
	margin-left: 0 !important;
}

.errorpPage-img,.errorpPage-tip,.errorpPage-operate {
	text-align: center;
}
</style>