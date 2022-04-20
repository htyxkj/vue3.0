export class Menu{
    menuId:string;
    menuName:string;
    haveChild:boolean;
    command:string;
    menuattr:number;
    top: boolean;
    menuIcon:string;
    private _childMenu:Array<Menu>=[];

    constructor(menuid:string,menuname:string,command:string,menuatr:number,btop:boolean,bchild:boolean,menuIcon:string){
        this.menuId = menuid
        this.menuName = menuname
        this.command = command
        this.menuattr = menuatr
        this.top = btop;
        this.haveChild = bchild;
        this.menuIcon = menuIcon;
    }

    public get childMenu() {
        return this._childMenu;
    }

    public addChild(value:Menu):void {
        this._childMenu.push(value);
    }
}