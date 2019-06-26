export default class BipLayConf {
    bcells:boolean = false //是否是布局
    comp:object
    name:string=''
    constructor(_bcomp:boolean,_comp:object,_name:string){
        this.bcells = _bcomp
        this.comp = _comp
        this.name = _name
            
    }
}