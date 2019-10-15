import { Cells } from '../pub/coob/Cells';
import BipLayCells from './BipLayCells';
import BipLayConf from './BipLayConf';
import {BIPUtils}from '@/utils/BaseUtil';
// B:(@60HT111#40726[-remark];T:60HTA111#725;@60HT111#70725[jyfs-])
export class BipLayout{
    laystr:string
    layType:string = 'B'
    binit:boolean = false
    compconfs:Array<BipLayConf>
    ccells:Cells[] = []
    constructor(_laystr:string,_cells?:Cells[]){
        console.log("BipLayout")
        this.laystr = _laystr
        console.log(_laystr)
        this.compconfs = new Array<BipLayConf>();
        if(this.laystr){
            //初始化界面组成
            let index = this.laystr.indexOf(':')
            if(_cells){
                this.ccells = _cells;
            }
            if(index>0){
                this.layType = this.laystr.substring(0,index)
                if(this.layType == 'U'){
                    let cel = this.ccells[0]
                    let lay = new BipLayCells(this.laystr,cel)
                    let cc = new BipLayConf(true,lay,lay.name,lay.bl);
                    this.compconfs.push(cc)
                    return;
                }
                let str = this.laystr.substring(index+1)
                str = str.substring(1,str.length-1)
                //str = '@60JH211#40725[-remark];T:(60JHA211#725//节哀节哀);@60JH211#60725[jyfs-]'
                let comps:Array<string> = this.doLayout(str);
                comps.forEach(cmpstr => {
                    if(cmpstr&&!cmpstr.startsWith('#')){
                        if(cmpstr.indexOf(':')>0){
                            let cp = new BipLayout(cmpstr,_cells);
                            let cc = new BipLayConf(false,cp,'',cp.compconfs[0].span);
                            this.compconfs.push(cc)
                        }else{
                            let objid = BIPUtils.baseUtil.getObjId(cmpstr);
                            let cel = this.getCells(objid,true,this.ccells);
                            let lay = new BipLayCells(cmpstr,cel)
                            let cc = new BipLayConf(true,lay,lay.name,lay.bl);
                            this.compconfs.push(cc)
                        }
                    }
                });
            }else{
                let objid = BIPUtils.baseUtil.getObjId(this.laystr);
                let cel = this.getCells(objid,true,this.ccells);
                let lay = new BipLayCells(this.laystr,cel)
                let cc = new BipLayConf(true,lay,lay.name,lay.bl);
                this.compconfs.push(cc)
            }
            this.binit = true

        }
    }

    doLayout(str:string):Array<string>{
        let hv:Array<string> = new Array<string>();
        let cs0:string[] = str.split('');
        let cdv = 0;
        let buf = ''
        cs0.forEach(c0 => {
            if(c0 === '(' || c0==='['){
                cdv++
            }else if(c0 === ')' || c0 === ']'){
                cdv--;
            }else if(cdv === 0 && (c0 === ';' || c0 === ',')){
                hv.push(buf)
                buf = ''
                c0=''
            }
            buf+=c0

        });
        hv.push(buf)
        return hv;
    }

    getCells(objid:string,bchild:boolean = true,_cells:Array<Cells>):any{
        let c = null
        for(let i=0;i<_cells.length;i++){
            let cell = _cells[i];
            if(cell.obj_id === objid){
                c = cell
                break
            }
            if(cell.haveChild){
                let cel = this.getCells(objid,true,cell.subLayCells)
                if(cel){
                    c = cel
                    break
                }
                continue
            }
        }
        return c;
    }
}