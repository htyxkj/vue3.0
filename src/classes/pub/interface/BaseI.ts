import CDataSet from '../CDataSet';

export interface BaseI{
    taxlb:number
    cellDataChange(cds:CDataSet,cellId:string,value:any):void ;
}