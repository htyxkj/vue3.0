export class BipMenuBtn{
    cmd:string
    name:string
    icon:string = "iconfont icon-bip-"
    size:string
    bIconleft:boolean = true
    enable:boolean = true
    hasIcon:boolean = true
    type:string = "";//按钮类型

    /**自定义DLG按钮 */
    dlgType:string
    dlgCont:string
    dlgSname:string = ""


    constructor(cmd:string,name:string){
        this.cmd = cmd;
        this.name = name;
        this.size = 'mini'
        this.dlgType = ""
        this.dlgCont = ""
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
}