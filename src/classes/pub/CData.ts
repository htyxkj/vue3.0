import CRecord from './CRecord';
import PageInfo from '../search/PageInfo';

export default class CData{
    data:Array<CRecord> //数据集合
    rmdata:Array<CRecord>//删除的数据
    sumData:Array<any>
    obj_id:string//对象ID
    index:number = -1
    attr!:number;
    _bnull:boolean = true;
    page:PageInfo = new PageInfo()
    constructor(_obj_id:string){
        this.data = new Array<CRecord>()
        this.rmdata = new Array<CRecord>()
        this.obj_id = _obj_id
        this.sumData = new Array<any>();
    }

    public addRecord(crd:CRecord,idx:number):number{
        let imx = this.data.length
        if(idx<0||idx>=imx){
            this.data.push(crd)
            this.index = imx;
        }else{
            this.data.splice(idx,0,crd)
            this.index = idx
        }
        this._bnull = false
        return this.index
    }

    public clearValues():void{
        this.data.length = 0
        this.rmdata.length = 0
        this.data = []
        this.index = 0
        this.attr &= ~(0x20000|0x80000)
    }

    getValues():Array<CRecord>{
        return this.data
    }

    getDataAtIndex(_i:number):CRecord{
        return this.data[_i];
    }

    removeIndex(_i:number){
        let ss = this.data.filter((item,index)=>{
            return index != _i;
        })
    }
    setStateSub(state: number){
        this.data.forEach((crd:CRecord) => {
            crd.c_state = state;
            if(crd.subs.length > 0){
                crd.subs.forEach(cd0=>{
                cd0.setStateSub(state)
                }) 
            }
        });
    }
}