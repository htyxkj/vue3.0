export default class AIdAssist{
    id:string
    layCells:Array<any> = []
    labers:Array<string> = []
    showColsIndex:Array<number> = []
    title:string = ''
    values:any
    showValues:string = ''
    initV:string = ''
    realV:string = ''
    bCL:boolean = false
    initOK:boolean = false //是否初始化完成
    constructor(_id:string){
        this.id = _id
    }

    
}