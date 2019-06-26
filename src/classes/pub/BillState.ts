
class BillState {
    readonly INSERT: number = 1; //--新增
    readonly EDITED: number = 2; //值改变
    readonly DELETE: number = 4; //加删除标志
    readonly EDITSUB: number = 8; //字表改变
    readonly EDITEDPK: number = 0x10; //主键改变
    readonly IMPORT: number = 0x20; //这主要用于导入记录(结合INSERT使用保存时先做更新不存在时再做插入)
    readonly REPLACESUB: number = 0x40; //(替换子表)修改前先删除子表
    readonly HISTORY: number = 0x80; //历史数据(仅做为显示用)
    readonly COPY: number = 0x100; //从其它记录拷贝过来
    readonly DICT: number = 0x200; //记录经过动态字典处理后置上该标记。
    readonly POSTED: number = 0x400; //记录已提交过
}

export const billState = new BillState()
