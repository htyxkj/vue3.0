import { Cells } from './pub/coob/Cells';

export default class BipInsAidNew{
    id:string
    title:string = ''
    labers:Array<string> = []
    showColsIndex:Array<number> = []
    values:Array<any>=[]
    showValues:string = ''
    cells:Cells = new Cells()
    contCells:Cells = new Cells()
    addCells:Cells = new Cells()
    addCellId:string=''
    slink:string=''
    sflag:string = ''
    sref:string=''
    total:number = 0
    groupFld:string=''
    bType:string=''
    mutiple:boolean = false
    cl:boolean = false
    showV:string = ''
    realV:string = ''
    constructor(_id:string){
        this.id = _id
    }
}