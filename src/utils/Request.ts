import { User } from "@/classes/User";
import qs from "qs";
import Vue from "vue";
import { GlobalVariable } from "./ICL";
import {BIPUtils}from './BaseUtil'
import QueryEntity from '@/classes/search/QueryEntity';
let tool = BIPUtils.baseUtil
export namespace BIPUtil {
  class ServerUtils {
    /**
     * @description 登录方法
     * @param user User对象
     */
    login(user: User) {
      let param = tool.getLoginParmasUri();
      param.usercode = user.userCode;
      param.pwd = tool.base64Encode(user.password);
      return this.getFromServer(param);
    }
    registered(param:any){
        let pm = tool.getRegisteredParam();
        param = Object.assign(param,pm);
        return this.getFromRegistered(param);
    }
    /**
     * @description 登录方法 根据秘钥登录
     * @param secret 秘钥
     */
    loginWithOutPwd(secret:string){
        let param = tool.getLoginWithOutPwdParmasUri();
        param.wxAppLetsSecret = secret;
        return this.getFromServer(param);
    }
    /**
     * @description 登出方法
     * @param user User对象
     */
    loginOut(user: User) {
        let param = tool.getLoginOutParmasUri();
        param.usercode = user.userCode;
        param.username = user.userName;
        param.snkey =  JSON.parse(window.sessionStorage.getItem('snkey')+'');
        return this.getFromServer(param);
    }
    /**
     * @description 修改密码
     * @param user      User对象
     * @param newPwd    新密码
     * @param oldPwd    旧密码
     */
    upPwd(user:User,newPwd:string,oldPwd:string){
        let param = tool.getUpPwdParmasUri();
        param.usercode = user.userCode;
        param.newPwd = tool.base64Encode(newPwd);
        param.oldPwd = tool.base64Encode(oldPwd);
        return this.getFromServer(param);
    }
    /**
     * @description 获取菜单参数
     * @param sbuid 业务号
     * @param menuid 菜单编码
     */
    getMenuParams(sbuid:string,menuid:string) {
      let param = tool.getMenuParmasURI(sbuid,menuid);
      return this.getFromServer(param);
    }
    /**
     * @description 获取对象
     * @param cellId 对象编码
     */
    getCCellsParams(cellId:string) {
      let param = tool.getCCellsURI(cellId);
      return this.getFromServer(param);
    }
    /**
     * @description 执行审批流 
     * @param ceaParam CeaPars对象
     * @param id 33:获取下一个审批节点；34：执行审批；39：执行审批退回；40：执行放弃审核
     */
    getCheckInfo(ceaParam:any,id:number){
        return this.getFromServer(tool.getCheckInfoParam(ceaParam,id));
    }
    /**
     * @description 获取工作流数据  拷贝定义
     * @param id 205：获取主对象数据  210 ：子对象数据
     * @param buidto 目标业务号
     * @param buidfr 来源业务号
     * @param qee QueryEntity：对象
     */
    getWorkFlowData(id:number,buidto:string,buidfr:string,qee: QueryEntity){
        let qe = JSON.stringify(qee)
        let param = tool.getWorkFlowDataParams(id,buidto,buidfr,qe);
        return this.getFromServer(param)
    }

    getFromServer(param:any){
        let data = qs.stringify(param);
        return Vue.$axios.post(GlobalVariable.API, data);
        //dubbo格式请求时，不需要将数据转jsonstring
        // return Vue.$axios.post(GlobalVariable.API, param,{headers:{'content-type':"application/json;charset=UTF-8"}});
    }
    getFromRegistered(param:any){
        let data = qs.stringify(param);
        return Vue.$axios.post(GlobalVariable.REGAPI, data);
        //dubbo格式请求时，不需要将数据转jsonstring
        // return Vue.$axios.post(GlobalVariable.API, param,{headers:{'content-type':"application/json;charset=UTF-8"}});
    }
    /**
     * @description 请求后台执行导出Excel
     * @param param 
     */
    async fileDown(param:any){
        let data = qs.stringify(param);
        let config:any ={responseType:"arraybuffer"};
        return Vue.$axios.post(GlobalVariable.API, data,config);
    }
    /**
     * @description 删除文件
     * @param param {snkey: , fjroot: , fjname: ,updid:'34'}
     */
    fileOPeration(param:any){
      let data = qs.stringify(param);
      return Vue.$axios.post(GlobalVariable.API_UPD, data);
    }
    /**
     * @description 保存数据
     * @param record   需要保存的数据：currRecord
     * @param pcellId  
     * @param buid 业务号
     */
    saveData(record:any,pcellId:string,buid:string,polnk:string=''){
        let param = tool.getSaveParams()
        param = Object.assign(param, { pcell: pcellId,buid:buid, polnk:polnk, jsonstr: JSON.stringify(record) })
        return this.getFromServer(param);
    }
    /**
     * @description 执行查询普通
     * @param qe QueryEntity对象
     */
    query(qe:QueryEntity){
        let param = tool.getQueryParams(JSON.stringify(qe));
        return this.getFromServer(param);
    }
    /**
     * @description 导出Excel文件
     * @param qe QueryEntity对象
     */
    queryExcel(qe:QueryEntity){
        let param = tool.getExcelParams(JSON.stringify(qe));
        return this.fileDown(param);
    }
    /**
     * @description 根据主对象查询子对象数据
     * @param qe QueryEntity对象
     */
    queryChild(qe:QueryEntity){
        let param = tool.getQueryChildParams(JSON.stringify(qe));
        return this.getFromServer(param);
    }
    /**
     * @description 执行RPT查询
     * @param qe qe QueryEntity对象
     */
    queryRPT(qe:QueryEntity){
        let param = tool.getQueryRPTParams(JSON.stringify(qe));
        return this.getFromServer(param);
    }
    /**
     * @description 获取业务定义
     * @param buid 业务号
     */
    getBULinks(buid:string){
        let param = tool.getBuidParams(buid)
        return this.getFromServer(param)
    }
    /**
     *@description 获取User对象
     */
    getUser(){
        return tool.getUser()
    }
    /**
     * @description 获取工作流
     * @param buidto 业务号 
     */
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

    /**
     * 弹出框执行SQL语句 常量里面定义的 DLG.
     * @param value 当前选中行内容
     * @param btn BipMenuBtn 对象
     */
    getDlgRunSql(value:string,btn:string){
        let param = tool.getDlgRunSqlParams(value,btn);
        return this.getFromServer(param)
    }
    /**
     * 弹出框执行SQL语句 常量里面定义的 DLG.
     * @param value 当前选中行内容
     * @param btn BipMenuBtn 对象
     */
    getDlgRunClass(env:string,btn:string){
        let param = tool.getDlgRunClassParams(env,btn);
        return this.getFromServer(param)
    }

    /**
     * @description 获取任务 或 消息
     * @param tskim 方法编码，
     * @param iid 消息编号，
     * @param state 消息状态，
     * @param buno 任务编码，
     * @param buid 任务业务，
     * @param tousr 用户，
     * @param page 页数，
     * @param size 条数，
     * @param keyword 消息关键字
     */
    getTaskMsgData(tskim:any,iid:any,state:any,buno:any,buid:any,tousr:any,page:any,size:any,keyword:any){ 
        let param = tool.getTaskMsgParams(tskim,iid,state,buno,buid,tousr,page,size,keyword);
        return this.getFromServer(param)
    }
    /**
     *  @description 获取服务器时间
     **/
    getServerTime(){
        let param = {apiId: GlobalVariable.APIID_TIME,};
        return this.getFromServer(param)
    }
  }

  export let ServApi = new ServerUtils();
}
