//压缩;浏览;查询;缓存;5:增加;删除;保存;非定位;审核;
//10:审批;关联;文件;图形;引用;15:功能文字;统计;外部SQL;展开;批量打印;
//20:全部打印;邮件;无表格线;行单元底线;行单元边框;25:普通表头;关闭速查;执行可改
export const CommICL = Object.assign({
    B_IPACK : 1, //采用压缩
    B_INAV : 2, //带滚动功能
    B_IFIND : 4, //带查询功能
    B_ICACHE : 8, //采用缓存
    B_IADD : 0x10, //增加
    B_IDEL : 0x20, //删除
    B_ISAVE : 0x40, //保存
    B_INOLOCATE : 0x80, //不带定位功能
    B_IWORKEA : 0x100, //带审批流定义
    B_ICHKINFO : 0x200, //列表显示审批表
    B_IRELATE : 0x400, //显示相关联的定义，如单据
    B_IFILE : 0x800, //文件
    B_IOUTTX : 0x1000, //图形
    B_IREFER : 0x2000,//引用
    B_ITXT : 0x4000,//工具条文本
    B_ISTAT : 0x8000,//统计功能(输入起用，输出关闭)
    B_IOUTSQL : 0x10000,//起用外部SQL
    B_IHEXP : 0x20000,//起用展开功能
    B_IPRNBATCH : 0x40000,//批量打印(提示指定范围)
    B_IPRNALL : 0x80000,//打印当前所有数据
    B_IMAIL : 0x100000,//发邮件
    B_UNLINE : 0x200000,//表格不画线
    B_IGRL : 0x400000,//行单元底线
    B_IGRUNL : 0x800000,//行单元边框
    B_IUNGGT : 0x1000000,//多行表格不画图
    B_IUNQF : 0x2000000,//关闭速查功能
    B_IOKED : 0x4000000,//执行可修改
    B_CMD_ADD:'ADD',//增加
    B_CMD_DEL:'DEL',//删除
    B_CMD_FIND:'FIND',//查找
    B_CMD_CLEAR:'CLEAR',//清空
    B_CMD_SAVE:'SAVE',//保存
    B_CMD_COPY:'COPY',//保存
    B_CMD_FIRST:'FIRST',//第一个
    B_CMD_PRIOR:'PRIOR',//上一个
    B_CMD_NEXT:'NEXT',//下一个
    B_CMD_LAST:'LAST',//最后一个
    B_CMD_FILE:'FILE',//最后一个
    B_CMD_SUBMIT:'SUBMIT',//提交
    B_CMD_CHKINFO:'CHKINFO',//审批信息
    B_CMD_CHECK:'CHECK',//审核
    B_CMD_CHECK_PROCESS:'CHECKPROCESS',
    B_CMD_PRINT:'PRINT',//打印
    B_CMD_LINK:'LINK',//连接
    B_CMD_LIST:'LIST',//连接
    B_CMD_ISTAT:'ISTAT',//统计
    B_CMD_IFILE:'DOWNLOADFILE',//文件
    B_CMD_ROWCOLUMN:'ROWCOLUMN',
    //#region 输入框常量
    I_EDITOR_COMM:0,//普通输入框
    I_EDITOR_LIST:1,//下拉框
    I_EDITOR_DATE:2,//日期输入框
    I_EDITOR_CHECK:3,//普通辅助输入框
    I_EDITOR_UPDOWN:4,//上传下载输入框
    I_EDITOR_GDIC:5,//商品辅助输入
    I_EDITOR_NUM:6,//商品辅助输入
    I_EDITOR_COPY:9,//拷贝定义
    I_EDITOR_TREE:10,//树
    I_EDITOR_RTEXT:11,//富文本编辑器
    I_EDITOR_SWITCH:14,//switch开关
//#endregion
    //#region 数据记录状态值
    R_EDITCTRL:0x1F,//-编辑控制属性和。
    R_INSERT:1,//--新增
    R_EDITED:2,//--值改变
    R_DELETE:4,//--加删除标志
    R_EDITSUB:8,//--字表改变
    R_EDITEDPK:0x10,//--主键改变
    R_IMPORT:0x20,//--这主要用于导入记录(结合INSERT使用,保存时先做更新,不存在时再做插入)
    R_REPLACESUB:0x40,//(替换子表)修改前先删除子表
    R_HISTORY:0x80,//历史数据(仅做为显示用)
    R_COPY:0x100,//从其它记录拷贝过来
    R_DICT:0x200,//记录经过动态字典处理后,置上该标记。
    R_POSTED: 0x400,//记录已提交过
    //#endregion
    EV_CELL_CHANGE:'cellDataChange',//

    //#region 辅助输入类别
    CELL_CGroupEditor:'CGroupEditor',
    CELL_CSelectEditor:'CSelectEditor',
    CELL_CFlagEditor:'CFlagEditor',
    CELL_CFlowEditor:'CFlowEditor',
    CELL_CQueryEditor:'CQueryEditor',
    CELL_CDynaEditorr:'CDynaEditor',
    CELL_CUpDownEditor:'CUpDownEditor',
    CELL_CGDicEditor:'CGDicEditor',
    CELL_CDateEditor:'CDateEditor',
    CELL_CYMEditor:'CYMEditor',
    CELL_CHSMEditor:'CHSMEditor',
    //#endregion
    AID_KEY:'KEY_',
    AID_KEYCL:'$KEY_',
    AID_TREE:'TREE_KEY_'

});