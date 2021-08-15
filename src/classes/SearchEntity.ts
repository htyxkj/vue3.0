import { Cell } from './pub/coob/Cell';
/**
 * 单据查询类
 */
export default class SearchEntity{
    id:string
    name:string
    cell:Cell
    v1:string = '' //第一个值
    v2:string = '' //第二个值  eg:查询 1 到 10  的数据
    constructor(_cell:Cell){
        this.cell = _cell
        this.id = _cell.id
        this.name = _cell.labelString
    }

}