export default class QueryCont{

    private key:string        //字段名称
    private value:string      //值
    private type:number       //字段类型  平台对象定义上的SQL类型
    private contrast:number = 0 //对比操作  0：= 1：>= 2:<= 3:like 4: <>  5:in 6:>  7: <
    private link:number = 0 //与下一个连接  0：or 或 1：and 
    private refer:number = 2 //当contrast 是like 时   0：%值，1：值%，2：%值%;

    constructor(key:string,value:string,type:number){
        this.key = key;
        this.value = value;
        this.type = type;
    }

    /**
     * 对比操作  0：= ; 1：>=; 2:<=; 3:like; 4: <>  5;:in ;6:> ; 7: <
     * @param value 
     */
    public setContrast(value:number){
        this.contrast = value;
    }

    public setLink(value:number){
        this.link= value
    }

    public setRefer(value:number){
        this.refer = value
    }
    
}