import CData from './CData';

export default class CRecord {
    c_state:number = 0
    data:any
    subs:Array<CData> = []
    id:string = ''
    oldpk:Array<any> = [];
    constructor(state:number=0){
        this.data = {}
        this.c_state = state
        this.id = this.guid()
    }

    S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1)+'';
    }
    guid():string {
        return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
    }
} 