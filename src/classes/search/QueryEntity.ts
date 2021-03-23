import PageInfo from './PageInfo';

export default class QueryEntity{
    pcell:string    //查询对象
    tcell:string    //条件对象
    cont:string     //条件
    mcont:string    //初始条件
    orderBy:string      //排序
    type:number = 0     
    page:PageInfo = new PageInfo()//分页信息
    values:Array<any> = [] //数据
    oprid:number = 13;//13查询数据，14，查询一条记录（包含主子）
    groupV:string = ''
    polnk:string = ''
    /**
     * 
     * @param _pcell 查询对象
     * @param _tcell 条件对象
     * @param _cont  条件
     * @param _orderBy 排序
     */
    constructor(_pcell:string,_tcell:string,_cont?:string,_orderBy?:string){
        this.pcell = _pcell
        this.tcell = _tcell
        this.cont = _cont?_cont:''
        this.orderBy = _orderBy?_orderBy:''
        this.mcont=''
        this.polnk = ''
    }
}