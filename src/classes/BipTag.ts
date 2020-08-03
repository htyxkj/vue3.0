export class BipTag{
    name:string;
    title:string;
    path:string;
    closable:boolean;
    tooltip:string
    constructor(_name:string,_title:string,_path:string,_closable:boolean,_tooltip:any = null){
        this.name = _name;
        this.title = _title;
        this.path = _path;
        this.closable = _closable;
        this.tooltip = _tooltip;
    }
}