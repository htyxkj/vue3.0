import BipInsAidNew from '@/classes/BipInsAidNew';

export interface BipInsState {
    aidInfos:Map<string,BipInsAidNew>//辅助、常量ID,对象信息
    inProcess:Map<string,boolean>//辅助ID,是否正在访问
    aidValues:Map<string,any>//辅助ID+查询条件,values值
}