<template>
</template>
<script lang="ts">
    import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
	@Component
	export default class BipGant extends Vue{
		@Prop() config!:any;
		state:any = {};
		gstc:any = {};
		mounted(){
			if(this.config){
			}
		}
		@Watch('config',{deep:true})
		configChange(val:any){
		}
	}
</script>

<style>
</style>
