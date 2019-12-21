import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { T } from "@/components/map/js/TMap";
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
export namespace TMapUtils {
    class TMapUtils {
        /**
         * 规划路线
         * @param lngLat 经纬度 信息   经度,纬度;经度,纬度。。。。。。
         * @param color 颜色 未实现
         * @param tMap 当前地图对象
         * @returns 线对象
         */
        async makeRoute(lngLat:string,color:string,tMap:any){
            if(lngLat && lngLat.length>1){
                let points:any = [];
                let boundary = lngLat.split(";");
                for (var j = 0; j < boundary.length; j++) {
                    let poin = boundary[j].split(",");
                    if (poin.length >= 2) {
                    points.push(new T.LngLat(poin[0], poin[1]));
                    }
                }
                //创建线对象
                let editLine = new T.Polyline(points);
                //向地图上添加线
                tMap.addOverLay(editLine); 
                return editLine;
            }
        }
        /**
         * 获取作业区、航空区
         * @param oaid 作业区 航空识别区 编码
         * @param tMap 当前地图对象
         * @returns 全部作业区全部点集合
         */
        async getOpera(oaid:any,tMap:any){
            let points:any = [];
            if(oaid){
                let aid = oaid.split(";")
                for(var i=0;i<aid.length;i++){
                    let cc = await this.getOpera0(aid[i],tMap);
                    points = points.concat(cc);
                }
            }
            return points;
        }
        async getOpera0(oid:any,tMap:any){
            let oneCont =[];
            let allCont = [];
            let cont = "";
            let qCont = new QueryCont('id', oid, 12);
            qCont.setContrast(0);
            oneCont.push(qCont);
            if (oneCont.length != 0) {
            allCont.push(oneCont);
            cont = "~" + JSON.stringify(allCont);
            }
            let qe: QueryEntity = new QueryEntity("", "");
            qe.page.currPage = 1;
            qe.page.pageSize = 400;
            qe.cont = cont;
            let vv = await tools.getBipInsAidInfo("ROUTEOPERA", 210, qe);
            let points:any =[];
            if(vv.data.id == 0){
                let values = vv.data.data.data.values;
                for(var i =0;i<values.length;i++){
                    let vl = values[i];
                    let cc = this.markSurface(vl.boundary1,vl.color,tMap)
                    points = points.concat(cc);
                }
            }
            return points;
        }
        /**
         * 获取避让区域
         * @param oid 作业区编码
         * @param tMap 当前地图对象
         */
        async getOperaBr(hoaid:any,tMap:any){
            if(hoaid){
                let haid = hoaid.split(";")
                for(var i=0;i<haid.length;i++){
                    this.getOperaBr0(haid[i],tMap);
                }
            }
        }
        async getOperaBr0(oid:any,tMap:any){
            let oneCont =[];
            let allCont = [];
            let cont = "";
            let qCont = new QueryCont('oid', oid, 12);
            qCont.setContrast(0);
            oneCont.push(qCont);
            if (oneCont.length != 0) {
            allCont.push(oneCont);
            cont = "~" + JSON.stringify(allCont);
            }
            let qe: QueryEntity = new QueryEntity("", "");
            qe.page.currPage = 1;
            qe.page.pageSize = 400;
            qe.cont = cont;
            let vv = await tools.getBipInsAidInfo("ROUTEOPERAA", 210, qe);
            if(vv.data.id == 0){
                let values = vv.data.data.data.values;
                for(var i =0;i<values.length;i++){
                    let vl = values[i];
                    if(vl.type ==1){
                        this.markSurface(vl.avoid,vl.color,tMap)
                    }else{
                        this.markpoint(vl.avoid,tMap)
                    }
                }
            }
        }
        /**
         * 画覆盖面
         * @param lngLat 经纬度 信息   经度,纬度;经度,纬度。。。。。。
         * @param color 覆盖区颜色
         * @param tMap  当前地图对象
         */
        markSurface(lngLat:string,color:string,tMap:any){
            let boundary = lngLat.split(";");
            var points = [];
            for (var j = 0; j < boundary.length; j++) {
                let poin = boundary[j].split(",");
                if (poin.length >= 2) {
                points.push(new T.LngLat(poin[0], poin[1]));
                }
            }
            //创建面对象
            var polygon = new T.Polygon(points, {
                color: "blue",
                weight: 3,
                opacity: 0.5,
                fillColor: color,
                fillOpacity: 0.5
            });
            tMap.addOverLay(polygon);
            return points;
        }
        /**
         * 画覆盖点
         * @param lngLat 经纬度 信息   经度,纬度
         * @param tMap  当前地图对象
         */
        markpoint(lngLat:string,tMap:any){
            var marker = new T.Marker(new T.LngLat(lngLat.split(",")[0], lngLat.split(",")[1]));
            //向地图上添加标注
            tMap.addOverLay(marker);
        }
        /**
         * 获取对象
         * @param cellid  对象编码
         */
        async getCell(cellid: string) {
            let res = await tools.getCCellsParams(cellid);
            let rtn: any = res.data;
            if (rtn.id == 0) {
                let kn: Array<Cells> = rtn.data.layCels;
                let cells = kn;
                return new CDataSet(cells[0]);
            } else {
                return new CDataSet("");
            }
        }
        /**
         * 检查非空项
         * @param cds CdataSet 对象
         */
        checkNotNull(cds: CDataSet): string {
            let bok:string = "";
            cds.ccells.cels.forEach(item => {
                if (item.unNull && bok == "") {
                    let vl = null;
                    let hide: any = [];
                    if (cds.currRecord.data[item.id] != null)
                        vl = cds.currRecord.data[item.id] + "";
                    if (!vl && hide.indexOf(item.id) == -1) {
                        bok = "【" + item.labelString + "】不能为空!";
                        return bok;
                    }
                }
            });
            return bok;
        } 
    }
    export let TMapUt = new TMapUtils();
}