export class Menu{
    menuId:string;
    menuName:string;
    haveChild:boolean;
    command:string;
    menuAttr:number;
    top: boolean;
    private _childMenu:Array<Menu>=[];

    constructor(menuid:string,menuname:string,command:string,menuatr:number,btop:boolean,bchild:boolean){
        this.menuId = menuid
        this.menuName = menuname
        this.command = command
        this.menuAttr = menuatr
        this.top = btop;
        this.haveChild = bchild;
    }

    public get childMenu() {
        return this._childMenu;
    }

    public addChild(value:Menu):void {
        this._childMenu.push(value);
    }
}