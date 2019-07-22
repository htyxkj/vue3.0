import CData from './pub/CData';

/**
 * 数据缓存类目
 */
export default class DataCache{
    page:number //页码
    values:CData = new CData(''); //数据
    bfind:boolean = true //是否是查找
    constructor(_key:number,_v:CData){
        this.page = _key
        this.values = _v
    }

    // setRecordAtIndex(crd:any,_i:number = 0){
    //     if(_i>0&&this.values.length>0){
    //         this.values[_i] = crd
    //     }
    // }
}