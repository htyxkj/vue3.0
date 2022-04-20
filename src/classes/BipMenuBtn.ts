import CDataSet from '@/classes/pub/CDataSet';
import { CommICL } from "@/utils/CommICL";
export class BipMenuBtn{
    cmd:string
    name:string
    icon:string = "iconfont icon-bip-"
    size:string
    bIconleft:boolean = true
    enable:boolean = true
    hasIcon:boolean = true
    type:string = "";//按钮类型
    hint:string = "";//按钮操作前 提示语句

    /**自定义DLG按钮 */
    dlgType:string
    dlgCont:string
    dlgSname:string = ""
    
    //按钮显示时机
    etap:string //事件节点  全程，保存之前，保存之后 all，save_before，save_after
    ftap:string //逻辑节点

    visible:boolean = false //按钮是否显示

    constructor(cmd:string,name:string){
        this.cmd = cmd;
        this.name = name;
        this.size = 'mini'
        this.dlgType = ""
        this.dlgCont = ""
        this.etap = ""
        this.ftap = ""
    }
    public setName(value:string):void{
        this.name = value;
    }
    public setIconFontIcon(icon_:string):void{
        if(icon_)
        icon_ = icon_.toLocaleLowerCase();
        this.icon = this.icon+icon_;
    }

    public setOtherIcon(_icon:string):void{
        _icon = _icon.toLocaleLowerCase();
        this.icon = _icon;
    }

    public setBtnSize(value:string):void{
        value = value.toLocaleLowerCase();
        this.size = value;
    }

    public setRight():void{
        this.bIconleft = false
    }

    public setBtnEnable(value:boolean):void{
        this.enable = value;
    }

    public setHasIcon(value:boolean):void{
        this.hasIcon = value
    }

    public setDlgType(value:string):void{
        this.dlgType = value
    }

    public setDlgCont(value:string):void{
        this.dlgCont = value
    }
    public setDlgSname(value:string):void{
        this.dlgSname = value
    }   
    public setType(value:string):void{
        this.type = value;
    }
    public setHint(value:string):void{
        this.hint = value;
    }
    public setEtap(value:string):void{
        this.etap = value;
    }
    public setFtap(value:string):void{
        this.ftap = value;
    }

    public getVisible(cds:CDataSet):boolean{
        this.visible = this.getVisible1(cds)
        return this.visible;
    }
    public getVisible1(cds:CDataSet):boolean{
        let visible = false;
        let crd = cds.currRecord;
        if(!crd){
            visible = false
            if(this.cmd=='ADD'){
                visible = true
            }
            return visible;
        }
        if(this.cmd == 'SAVE' || this.cmd == 'DEL'){
            if(this.cmd =='SAVE'){
                if ((crd.c_state & 2) > 0 || (crd.c_state & 1) > 0) {
                    visible = true;
                    return visible;
                }
            }
            if(this.cmd=='DEL'){
                if ((crd.c_state & 1) > 0) {
                    visible = false;
                    return visible;
                }else{
                    visible = true;
                    return visible;
                }
            }
            if(cds.opera){
                let statefld = cds.opera.statefld;
                let state = null;
                if(statefld){
                    state = crd.data[statefld];
                }
                if(state){
                    state = state+""
                    if(state == '0' || state =='-1'){
                        visible = true;
                    }else{
                        visible = false;
                    }
                }else{
                    visible = true;
                }
            }
            return visible;
        }else if(['COPY','ADD','CHECKPROCESS','SUBMIT'].indexOf(this.cmd) >-1){
            if ((crd.c_state & 1) > 0) {
                visible = false;
            }else{
                visible = true;
            }
            return visible;
        }
        visible = false
        if(this.etap){
            if(this.etap == 'all'){ //全程
                visible = true
            } else if(this.etap == 'save_before'){//保存之前
                if ((crd.c_state & 2) > 0 || (crd.c_state & 1) > 0) {
                    visible = true;
                }
            } else if(this.etap =='save_after'){//保存之后
                if ((crd.c_state & CommICL.R_INSERT) == 0 || crd.c_state == 0) {
                    visible = true;
                }
            }
        }
        if(this.ftap){
            visible = eval(this.ftap);
        }
        if(!this.etap && !this.ftap){
            visible = true;
        }
        return visible;
    }
}