import { User } from "@/classes/User";
import qs from "qs";
import Vue from "vue";
import { GlobalVariable } from "./ICL";
import {BIPUtils}from './BaseUtil'
import QueryEntity from '@/classes/search/QueryEntity';
import axios from 'axios'
let tool = BIPUtils.baseUtil
export namespace BIPUtil {
  class ServerUtils {
    login(user: User) {
      let param = tool.getLoginParmasUri();
      param.usercode = user.userCode;
      param.pwd = tool.base64Encode(user.password);
      return this.getFromServer(param);
    }

    getMenuParams(sbuid:string,menuid:string) {
      let param = tool.getMenuParmasURI(sbuid,menuid);
      return this.getFromServer(param);
    }

    getCCellsParams(cellId:string) {
      let param = tool.getCCellsURI(cellId);
      return this.getFromServer(param);
    }

    getCheckInfo(ceaParam:any,id:number){
        return this.getFromServer(tool.getCheckInfoParam(ceaParam,id));
    }

    getConstValuesById(constId:string){
        let param = tool.getConstParams('$'+constId);
        return this.getFromServer(param);
    }

    getAidValuesById(aId:string,cont?:string,page = 1,pageSize = 20){
        let param = tool.getAIdParams(aId,cont,page,pageSize);
        return this.getFromServer(param);
    }

    getRefValuesById(aId:string,cont?:string){
        let param = tool.getRefValuesParams(aId,cont);
        return this.getFromServer(param);
    }

    getRefById(aId:string,cont?:string){
      let param = tool.getRefParams(aId,cont);
      return this.getFromServer(param);
    }

    getWorkFlowData(id:number,buidto:string,buidfr:string,qee: QueryEntity){
        let qe = JSON.stringify(qee)
        let param = tool.getWorkFlowDataParams(id,buidto,buidfr,qe);
        return this.getFromServer(param)
    }

    getFromServer(param:any){
        // const options = {
        //     method: 'POST',
        //     headers: { 'content-type': 'text/plain' },
        //     data: qs.stringify(param),
        //     url:GlobalVariable.API,
        //   };
        //   return Vue.$axios(options);
        let data = qs.stringify(param);
        return Vue.$axios.post(GlobalVariable.API, data);
        //dubbo格式请求时，不需要将数据转jsonstring
        // return Vue.$axios.post(GlobalVariable.API, param,{headers:{'content-type':"application/json;charset=UTF-8"}});
    }

    fileOPeration(param:any){
      let data = qs.stringify(param);
      return Vue.$axios.post(GlobalVariable.API_UPD, data);
    }

    saveData(record:any,pcellId:string,buid:string){
        let param = tool.getSaveParams()
        param = Object.assign(param, { pcell: pcellId,buid:buid, jsonstr: JSON.stringify(record) })
        return this.getFromServer(param);
    }

    query(qe:QueryEntity){
        let param = tool.getQueryParams(JSON.stringify(qe));
        return this.getFromServer(param);
    }
    queryRPT(qe:QueryEntity){
        let param = tool.getQueryRPTParams(JSON.stringify(qe));
        return this.getFromServer(param);
    }

    getBULinks(buid:string){
        let param = tool.getBuidParams(buid)
        return this.getFromServer(param)
    }

    getUser(){
        return tool.getUser()
    }

    getWorkFlows(buidto:string){
        let param = tool.getWorkFlowParams(buidto);
        return this.getFromServer(param);
    }

    /**
     * @description 获取服务器辅助、常量、产品核算单位
     * @param aid 辅助或者常量ID，或者产品编码
     * @param id 辅助200，常量，300，辅助取值210，产品核算单位查询400
     * @param qe 查询条件，有可能有
     */
    getBipInsAidInfo(aid:string,id:number=200,qe?:QueryEntity){
        if(qe)
            qe.type =3 
        let param = tool.getBipInsAidParams(aid,id,qe?JSON.stringify(qe):undefined);
        return this.getFromServer(param);
    }


    getDlgRunSql(value:string,btn:string){
        let param = tool.getDlgRunSqlParams(value,btn);
        return this.getFromServer(param)
    }

        /**
         * 方法编码，消息编号，消息状态，任务编码，任务业务，用户，页数，条数，消息关键字
         */
    getTaskMsgData(tskim:any,iid:any,state:any,buno:any,buid:any,tousr:any,page:any,size:any,keyword:any){ 
        let param = tool.getTaskMsgParams(tskim,iid,state,buno,buid,tousr,page,size,keyword);
        return this.getFromServer(param)
    }

    test(){
        
        let data = JSON.stringify({"id":200,"sid":9999,"jsondata":[{"id":222}]})
        return axios.post("http://127.0.0.1:9000/mesapi/udp", data);
    } 
  }

  export let ServApi = new ServerUtils();
}
