export class URIParams{
    beBill: boolean = false //是否是单据
    bgroup: boolean = false //是否显示图标
    pattr: number = 0 //按钮属性
    pbds: any = "" //其它+
    pbuid: string =  "" //标识
    pcell: string = "" //组成
    pclass: string = "" //
    pdata: string = "" //取数条件
    pflow: string = "" //业务号
    pinvoke: string = "" // INVOKE
    plabel: string = "" //说明
    playout: string = ""//布局+
    pproc: string = "" // PROC
    pwfproc: string = "" // 流程接口 服务端调用
    width: string = "50" //表格宽度
    bgroupList:any=[]//初始化显示图标参数
    constructor(){}
}