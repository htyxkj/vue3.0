import AIdAssist from '@/classes/AIdAssist';

export interface AssistState {
    aidInfos:Map<string,AIdAssist>//辅助ID,对象信息
    keyMaps:Map<string,boolean>//辅助ID,是否正在访问
    aidValues:Map<string,any>//辅助ID+查询条件,values值
    clInfos:Map<string,any>// 常量信息Map
}