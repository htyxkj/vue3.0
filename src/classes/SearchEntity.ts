import { Cell } from './pub/coob/Cell';

export default class SearchEntity{
    id:string
    name:string
    cell:Cell
    v1:string = ''
    v2:string = ''
    constructor(_cell:Cell){
        this.cell = _cell
        this.id = _cell.id
        this.name = _cell.labelString
    }

}