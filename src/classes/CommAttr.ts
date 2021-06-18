export default class CommATTR{
    public  constructor(){}
    /**
     * 只读
     */
    readonly READ:number = 0x40; 
    /**
     * 隐藏
     */
    readonly HIDE:number = 0x400; 
    /**
     * 多选 */  
    readonly MULTIPLE:number = 0x200000;

    /**
     * 格式
     */
    readonly FMT:number = 0x10000;
    /**
     * 码名|文本
     */
    readonly CODE:number = 0x40000;

    /**
     * 非输入|滤0
     */
    readonly NOENIT:number = 0x2000000;
}
