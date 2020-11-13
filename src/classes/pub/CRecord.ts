import CData from './CData';

export default class CRecord {
    c_state:number = 0 //行状态
    data:any    //行数据
    subs:Array<CData> = []  //子对象信息
    id:string = ''  //行id
    oldpk:Array<any> = [];  //主键修改储存旧主键值
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