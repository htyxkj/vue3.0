import PageInfo from './PageInfo';

export default class QueryEntity{
    pcell:string
    tcell:string
    cont:string
    mcont:string
    orderBy:string
    type:number = 0
    page:PageInfo = new PageInfo()
    values:Array<any> = []
    oprid:number = 13;//13查询数据，14，查询一条记录（包含主子）
    groupV:string = ''
    constructor(_pcell:string,_tcell:string,_cont?:string,_orderBy?:string){
        this.pcell = _pcell
        this.tcell = _tcell
        this.cont = _cont?_cont:''
        this.orderBy = _orderBy?_orderBy:''
        this.mcont=''
    }
}