export default class BipLayConf {
    bcells:boolean = false //是否是布局
    comp:object
    name:string=''
    span:number = 0.5
    constructor(_bcomp:boolean,_comp:object,_name:string,_span:number = 0.5){
        this.bcells = _bcomp
        this.comp = _comp
        this.name = _name   
        this.span = _span     
    }

}