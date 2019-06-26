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

    saveData(record:any,pcellId:string){
        let param = tool.getSaveParams()
        param = Object.assign(param, { pcell: pcellId, jsonstr: JSON.stringify(record) })
        return this.getFromServer(param);
    }

    query(qe:QueryEntity){
        let param = tool.getQueryParams(JSON.stringify(qe));
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

    test(){
        
        let data = JSON.stringify({"id":200,"sid":9999,"jsondata":[{"id":222}]})
        return axios.post("http://127.0.0.1:9000/mesapi/udp", data);
    }
    
  }

  export let ServApi = new ServerUtils();
}
