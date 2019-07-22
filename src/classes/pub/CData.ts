import CRecord from './CRecord';
import PageInfo from '../search/PageInfo';

export default class CData{
    _data:Array<CRecord> //数据集合
    _rmdata:Array<CRecord>//删除的数据
    obj_id:string//对象ID
    index:number = -1
    attr!:number;
    _bnull:boolean = true;
    page:PageInfo = new PageInfo()
    constructor(_obj_id:string){
        this._data = new Array<CRecord>()
        this._rmdata = new Array<CRecord>()
        this.obj_id = _obj_id
    }

    public addRecord(crd:CRecord,idx:number):number{
        let imx = this._data.length
        if(idx<0||idx>=imx){
            this._data.push(crd)
            this.index = imx;
        }else{
            this._data.splice(idx,0,crd)
            this.index = idx
        }
        this._bnull = false
        return this.index
    }

    public clearValues():void{
        this._data.length = 0
        this._rmdata.length = 0
        this._data = []
        this.index = 0
        this.attr &= ~(0x20000|0x80000)
    }

    getValues():Array<CRecord>{
        return this._data
    }

    getDataAtIndex(_i:number):CRecord{
        return this._data[_i];
    }

    removeIndex(_i:number){
        console.log(this._data)
        let ss = this._data.filter((item,index)=>{
            return index != _i;
        })
        console.log(ss)
    }
}