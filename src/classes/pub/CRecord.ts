import CData from './CData';

export default class CRecord {
    c_state:number = 0
    data:any
    subs:Array<CData> = []
    constructor(state:number=0){
        this.data = {}
        this.c_state = state
    }
} 