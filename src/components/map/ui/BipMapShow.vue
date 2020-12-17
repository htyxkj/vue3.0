<template>
	<div style="min-height: -webkit-fill-available">
		<t-map ref="TMap" class="myTMap"></t-map>
	</div>
</template>

<script lang="ts">
import { Vue, Provide, Component, Prop, Watch} from 'vue-property-decorator';
import { State, Action, Getter, Mutation } from "vuex-class";
import BipInsAidNew from '@/classes/BipInsAidNew';
import {T} from "@/components/map/js/TMap"
import tMap from "@/components/map/MyTianMap.vue";
import { Cell } from "@/classes/pub/coob/Cell";
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
@Component({components:{tMap}})
export default class BipMapShow extends Vue {
	loading:any = false;
	tMap:any= null;
	tZoom:number=12;
	@Prop() cels:any;
	@Prop() pdList:any;
	map_name_cell:any=null;
	map_root_cell:any=null;
	CloudMarkerCollection:any = null; //天地图海量点对象
	pointMsg:any={};//每个点的提示信息

	@State("aidInfos", { namespace: "insaid" }) aidInfo: any;
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Action("fetchInsDataByCont", { namespace: "insaid" }) fetchInsDataByCont: any;
	mounted(){
        if(this.cels){
            for(var i=0;i<this.cels.length;i++){
                if(this.cels[i].editType==12){//地图
                    this.map_name_cell = this.cels[i];
                    if(this.cels[i+1]){
                        this.map_root_cell = this.cels[i+1];
                    }
                    break;
                }
            }
        }
		this.$nextTick(function(){
            if (this.$refs.TMap) {
                let refT: any = this.$refs.TMap;
                this.tMap = refT.getMap();
            }
		})
	}
	async initMapData(){
		this.tMap.clearOverLays();
		if(this.pdList){
			let points:any=[];
			for(var i=0;i<this.pdList.length;i++){
				let data = this.pdList[i].data;
				if(data[this.map_root_cell.id]){
					let lng = "";
					let lat = "";
					let root = data[this.map_root_cell.id];
					lng = root.split(";")[0]
					lat = root.split(";")[1]
					let lgt = new T.LngLat(lng, lat)
					let key = lng+"_"+lat
					lgt.kid = key
					points.push(lgt);
					let msg = "<div>";
					for(var j=0;j<this.cels.length;j++){
						if((this.cels[j].attr & 0x400 ) == 0 && (this.cels[j].attr & 0x200 )>0){
							let val = data[this.cels[j].id];
							val = val ==null?"":val;
							if(val != "" && this.cels[j].refValue){
								val = await this.makeRef(val,this.cels[j]);
							}
							msg+= (this.cels[j].labelString + "："+val+"<br/>");
						}
					}
					this.pointMsg[key]= msg;
					var marker = new T.Marker(lgt);// 创建标注
					let _this = this;
					marker.addEventListener("click", function (e:any) {
						var lnglat = e.lnglat;
						//创建信息窗口对象
						var infoWin = new T.InfoWindow();
						infoWin.setLngLat(lnglat);
						//设置信息窗口要显示的内容
						infoWin.setContent(_this.pointMsg[lnglat.kid]);
						_this.tMap.addOverLay(infoWin);
					});// 将标注添加到地图中
                	this.tMap.addOverLay(marker);
				}
			}
			if(points.length>0){
				let cc = this.tMap.getViewport(points);
				this.tMap.centerAndZoom(cc.center,cc.zoom)
			}
			//海量点
			// if(points.length>0){
			// 	this.CloudMarkerCollection = new T.CloudMarkerCollection(points,{
			// 		color:'blue',
			// 		SizeType:'TDT_POINT_SIZE_HUGE',
			// 		ShapeType:'TDT_POINT_SHAPE_WATERDROP'
			// 		// 海量点的预设形状。
			// 		// TDT_POINT_SHAPE_CIRCLE 圆形，为默认形状。
			// 		// TDT_POINT_SHAPE_STAR星形。
			// 		// TDT_POINT_SHAPE_SQUARE方形。
			// 		// TDT_POINT_SHAPE_RHOMBUS菱形。
			// 		// TDT_POINT_SHAPE_WATERDROP滴状。
			// 	})
			// 	let _this = this;
			// 	this.CloudMarkerCollection.addEventListener("click", function (e:any) {
			// 		var lnglat = e.lnglat;
			// 		//创建信息窗口对象
			// 		var infoWin = new T.InfoWindow();
			// 		infoWin.setLngLat(lnglat);
			// 		//设置信息窗口要显示的内容
			// 		infoWin.setContent(_this.pointMsg[lnglat.kid]);
			// 		_this.tMap.addOverLay(infoWin);
			// 	});// 将标注添加到地图中 
			// 	this.tMap.addOverLay(this.CloudMarkerCollection);
			// }
		}
	}
	async makeRef(val:any,cell:Cell){
		let ref = cell.refValue ||cell.editName
		let bipInsAid:BipInsAidNew = new BipInsAidNew("");
		if(ref.indexOf('{')>-1){
			ref = ref.substring(ref.indexOf('{')+1,ref.indexOf('}'));
			if(ref.startsWith('$')){
				bipInsAid.cl = true;
				ref = ref.substring(1);
			}else{
				if(ref.startsWith('&')){
					ref = ref.substring(1);
				}
			}
			// console.log(ref)
			let editName = ref;
			let aidKey = bipInsAid.cl?(ICL.AID_KEYCL+ref):(ICL.AID_KEY+ref);
			let rr = this.aidInfo.get(aidKey);
			if(rr){
				bipInsAid = rr;
				bipInsAid.id = editName;
			}else{
				let res = await this.fetchInsAid({ id: (bipInsAid.cl?300:200), aid: editName });
				if(res.data && res.data.id ==0){
					bipInsAid = res.data.data.data;
				}else if(res){
					bipInsAid = res;
				}else{
					return val;
				}
			}
			if(bipInsAid.cl){//常量
				if(bipInsAid.values){
					let idx = bipInsAid.values.findIndex((item:any)=>{
						return item[bipInsAid.cells.cels[0].id]+'' === val+'';
					})
					if(idx>-1){
						let item = bipInsAid.values[idx];
						val = item[bipInsAid.cells.cels[1].id];
					}
				}
			}else{//辅助
				aidKey = ICL.AID_KEY+bipInsAid.id; 
				let key = aidKey+"_"+val;
				let rr = this.aidValues.get(key);
				if(rr){
					bipInsAid.values[0] = rr;
					bipInsAid = this.makeShow(bipInsAid,val);
					val = bipInsAid.showV;
				}else{
					let key = aidKey+"_"+val;
					let rtn = this.aidValues.get(key);
					if(!rtn){
						let cel = bipInsAid.cells.cels[0];
						if(cel){
							let cont = "";
							if(cel.type<12){
								cont = cel.id+"="+val+""
							}else{
								cont = cel.id+"='"+val+"'"
							}
							let vvs = {id:bipInsAid.id,key:key,cont:cont}
							await this.fetchInsDataByCont(vvs);
							let rr = this.aidValues.get(key);
							if(rr){
								bipInsAid.values[0] = rr;
								bipInsAid = this.makeShow(bipInsAid,val);
								val = bipInsAid.showV;
							}
						}
					}else{
						bipInsAid.values[0] = rr;
						bipInsAid = this.makeShow(bipInsAid,val);
						val = bipInsAid.showV;
					}
				}
			}
		}else{
		}
		return val;
	}

	makeShow(bipInsAid:any,val:any) {
		if(bipInsAid.values&&bipInsAid.values.length>0){
			if(bipInsAid.values){
				bipInsAid.showV = ''
				for(var i=0;i<bipInsAid.values.length;i++){
					let vv = bipInsAid.values[i];
					bipInsAid.showV += vv[bipInsAid.cells.cels[1].id]+";"||bipInsAid.realV+";"
				}
				if(bipInsAid.showV.length>1)
					bipInsAid.showV = bipInsAid.showV.substring(0,bipInsAid.showV.length-1)
			}else{
				bipInsAid.showV = bipInsAid.realV
			}
		}else{
			bipInsAid.realV = val
			bipInsAid.showV = bipInsAid.realV
		}
		return bipInsAid;
    }

	@Watch("pdList")
	pdListChange(){
		if(this.tMap){
			this.initMapData();
		}
	}

}
</script>

<style lang="scss" scoped>
.myTMap {
    height: calc(100% - 0px) !important;
    width: 100%;
    outline: none;
	min-height: 570px;
}
</style>
