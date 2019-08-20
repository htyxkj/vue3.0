import { GlobalVariable } from "./ICL";
import { BaseVariable } from "./BaseICL";
import moment from "moment";
import { User } from '@/classes/User';
import BipInsAidNew from '@/classes/BipInsAidNew';
import { Cells } from '@/classes/pub/coob/Cells';
import { Cell } from '@/classes/pub/coob/Cell';
import { Menu } from "@/classes/Menu";
export namespace BIPUtils {
  class BaseUtil {
    getLoginParmasUri() {
      return Object.assign({
        apiId: GlobalVariable.API_ID_LOGIN,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID
      });
    }
    getLoginOutParmasUri() {
      return Object.assign({
        apiId: GlobalVariable.APIID_LOGOUT,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID
      });
    }
    getUpPwdParmasUri() {
      return Object.assign({
        apiId: GlobalVariable.APIID_UPPWD,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID
      });
    }

    getMenuParmasURI(sbuid: string, menuId: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_MPARAMS,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        pbuid: sbuid,
        pmenuid: menuId
      });
    }

    getUser():User{
       let user = JSON.parse(window.sessionStorage.getItem("user") + "")
       return user
    }

    getCCellsURI(cellId: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_CELLPARAMS,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        pcell: cellId
      });
    }

    getSaveParams() {
      return Object.assign({
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        apiId: GlobalVariable.APIID_SAVEDATA,
        pcell: "",
        jsonstr: "",
        datatype: 1
      });
    }

    getConstParams(constId: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_AIDPARAMS,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        assistid: constId
      });
    }

    getQueryParams(qe: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_QUERY,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        qe: qe
      });
    }
    getExcelParams(qe: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_EXPDATA,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        qe: qe
      });
    }
    getQueryRPTParams(qe: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_QUERYRPT,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        qe: qe
      });
    }

    getWorkFlowDataParams(id:number,buidto:string,buidfr:string,qe: string) {
        return Object.assign({
            apiId: GlobalVariable.APIID_WORKFLOW,
            dbid: BaseVariable.COMM_FLD_VALUE_DBID,
            usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
            .userCode,
            id:id,
            buidto:buidto,
            buidfr:buidfr,
            qe: qe
        });
    }

    getAIdParams(aId: string, cons?: string, page = 1, pageSize = 20) {
      return Object.assign({
        apiId: GlobalVariable.APIID_AID_ASSIST_DATA,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        assistid: aId,
        cont: cons ? cons : "",
        page: page,
        pageSize: pageSize
      });
    }

    getRefParams(aId: string, cons?: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_AIDPARAMS,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        assistid: aId,
        cont: cons ? cons : ""
      });
    }

    getBuidParams(buid: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_BUID,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        buid: buid
      });
    }

    getWorkFlowParams(buid: string) {
        return Object.assign({
            apiId: GlobalVariable.APIID_WORKFLOW,
            dbid: BaseVariable.COMM_FLD_VALUE_DBID,
            usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
                .userCode,
            buidto: buid
        });
      }

    getRefValuesParams(aId: string, cons?: string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_AID_ASSIST_DATA,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
          .userCode,
        assistid: aId,
        cont: cons ? cons : ""
      });
    }

    getCheckInfoParam(ceaParam:any,id:number){
        let checkParasm = {
            dbid:BaseVariable.COMM_FLD_VALUE_DBID,
            usercode: JSON.parse(window.sessionStorage.getItem("user")+'').userCode,
            apiId: GlobalVariable.APIID_CHK,
            chkid:id,
            cea:JSON.stringify(ceaParam)
          }
        return checkParasm
    }

    getBipStatisticsParams(qe:string,groupfilds:string,groupdatafilds:string){
      return Object.assign({
        apiId: GlobalVariable.APIID_FINDSTATDATA,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
        groupfilds:groupfilds,
        groupdatafilds:groupdatafilds, 
        qe: qe
      });
    }

    /**
     * @description 获取辅助/常量元素对象
     * @param aId 辅助后者常量ID
     * @param id 200 辅助,300常量
     */
    getBipInsAidParams(aId: string,id:number=200,qe?:string) {
        return Object.assign({
          apiId: GlobalVariable.APIID_BIPINSAID,
          dbid: BaseVariable.COMM_FLD_VALUE_DBID,
          usercode: JSON.parse(window.sessionStorage.getItem("user") + "")
            .userCode,
          aid: aId,
          id:id,
          qe:qe
        });
    }
    /**
     * @description 获取辅助/常量元素对象
     * @param aId 辅助后者常量ID
     * @param id 200 辅助,300常量
     */
    getDlgRunSqlParams(value: string,btn:string) {
      return Object.assign({
        apiId: GlobalVariable.APIID_DLGSQLRUN,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
        value: value,
        btn:btn, 
      });
    }

    base64Encode(str: string) {
      var pwd = encodeURIComponent(str);
      pwd = unescape(pwd);
      pwd = window.btoa(pwd);
      return pwd;
    }

    getObjId(str: string): string {
      if (str.startsWith("@")) str = str.substring(1);
      let index = str.indexOf("#");
      if (index > 0) {
        str = str.substring(0, index);
        return str;
      }

      index = str.indexOf("[");
      if (index > 0) {
        str = str.substring(0, index);
      }
      index = str.indexOf("/");
      if (index > 0) {
        str = str.substring(0, index);
      }
      index = str.indexOf("*");
      if (index > 0) {
        str = str.substring(0, index);
        return str;
      }
      return str;
    }

    nextQuote(
      buf: string,
      cs0: string[],
      x0: number,
      x1: number,
      ch: string
    ): any {
      buf += ch;
      for (x0++; x0 < x1; x0++) {
        var c0 = cs0[x0];
        if (c0 == ch) {
          buf += ch;
          return [x0, buf];
        }
        if (c0 === "\\") {
          x0++;
          if (x0 < x1) {
            c0 = cs0[x0];
            if (c0 === "n") c0 = "\n";
            else if (c0 === "t") c0 = "\t";
            else if (c0 === "r") c0 = "\r";
          }
        }
        buf += c0;
      }
      return [x1, buf];
    }
    nextQuote4(cs0: string[], x0: number, x1: number, ch: string): number {
      for (x0++; x0 < x1; x0++) {
        var c0 = cs0[x0];
        if (c0 == ch) return x0;
        if (c0 == "\\") x0++;
      }
      return x1;
    }

    nextBarcket4(cs0: string[], x0: number, x1: number, chL: string) {
      let chR = chL == "[" ? "]" : chL == "(" ? ")" : "}";
      let ct = 0;
      for (x0++; x0 < x1; x0++) {
        var c0 = cs0[x0];
        if (c0 == chR) {
          if (ct < 1) return x0;
          ct--;
        } else if (c0 == chL) {
          ct++;
        } else if (c0 == "\\") {
          x0++;
        } else if (c0 == "'" || c0 == '"') {
          x0 = this.nextQuote4(cs0, x0, x1, c0);
        }
      }
      return x1;
    }

    nextBarcket(
      buf: string,
      cs0: string[],
      x0: number,
      x1: number,
      chL: string
    ): any {
      let c0,
        chR = chL == "(" ? ")" : chL == "[" ? "]" : "}";
      buf += chL;
      x0++;
      for (let ct = 0; x0 < x1; x0++) {
        c0 = cs0[x0];
        if (c0 == chR) {
          buf += c0;
          if (ct < 1) return [x0, buf];
          ct--;
        } else if (c0 == "'" || c0 == '"') {
          let retn = this.nextQuote(buf, cs0, x0, x1, c0);
          x0 = retn[0]; //;-括号中的不算。
          buf = retn[1];
        } else {
          buf += c0;
          if (c0 == chL) ct++;
          else if (c0 == "\\") {
            x0++;
            if (x0 < x1) buf += cs0[x0];
          }
        }
      }
      return [x1, buf];
    }

    // 两个数值做运算
    calcTwoNumber(o0: any, o1: any, cfh: string, cpnt: number) {
      if (cfh == "+" || cfh == "-" || cfh == "*" || cfh == "/") {
        let n1 = new Number(o0).valueOf();
        let n2 = new Number(o1).valueOf();
        if (cfh == "+") {
          let a = n1 + n2;
          return a;
        }
        if (cfh == "-") {
          var a = n1 - n2;
          return a;
        }
        if (cfh == "*") {
          var a = n1 * n2;
          return a;
        }
        if (cfh == "/") {
          var a = n1 / n2;
          return a;
        }
      }
    }
    calcTwoItem(o0: any, o1: any, cfh: number): any {
      var c0 = String.fromCharCode(cfh & 0xff),
        c1 = String.fromCharCode(cfh >>> 8);
      if (c1 === "=" || c0 === "<" || c0 === ">") {
        // 逻辑比较值
        return true;
      }
      return this.calcTwoValue(o0, o1, c0);
    }

    calcItems(ovs: Array<any>, fhs: Array<any>, idx: number) {
      var x0 = idx - 2,
        x1 = idx - 1,
        c0 = this.tolevel(fhs[x0]);
      if (c0 < 1 || c0 < this.tolevel(fhs[x1])) return idx; //注意赋值语句
      ovs[x0] = this.calcTwoItem(ovs[x0], ovs[x1], fhs[x0].charCodeAt(0));
      ovs[x1] = ovs[idx];
      fhs[x0] = fhs[x1];
      idx--;
      if (idx > 1) idx = this.calcItems(ovs, fhs, idx);
      return idx;
    }

    tolevel(c01: string): number {
      let c11 = c01.charCodeAt(0) & 0xff;
      let c0: string = String.fromCharCode(c11);
      if (c01 == "=") return 0; //不支持等号与运算符连用,如"+=","*="等，用"A=A+..."表示
      if (c0 == "&" || c0 == "|" || c0 == "^") return 1;
      if (c0 == ">" || c0 == "<") return 2;
      if (c0 == "+" || c0 == "-") return 3;
      if (c0 == "*" || c0 == "/" || c0 == "%") return 4;
      return 0;
    }

    //最终的两个数值运算，可以直接在接口中调用。
    calcTwoValue(o0: any, o1: any, ysf: string) {
      if (ysf == "+" || ysf == "|") {
        if (o0 == null) return o1;
        if (o1 == null) return o0;
        if (
          ysf == "+" &&
          !(o0 instanceof Date) &&
          (!(o0 instanceof Number) || !(o1 instanceof Number))
        )
          return o0 + "" + o1;
      }
      return this.calcTwoObject(o0, o1, ysf, 0);
    }

    calcTwoObject(o0: any, o1: any, ysf: string, cpnt: number) {
      return this.calcTwoNumber(o0, o1, ysf, cpnt);
    }

    dateAdd(fps: Array<any>) {
      let d1 = fps[0];
      var day1 = moment(d1);
      const day = fps[1];
      const mon = fps[2];
      const year = fps[3];
      const hou = fps[4];
      const min = fps[5];
      return day1
        .add(day, "d")
        .add(mon, "M")
        .add(year, "y")
        .add(hou, "h")
        .add(min, "m")
        .format("YYYY-MM-DD HH:mm:ss");
    }

    /**
     * 日期相减函数，返回不同的时间间隔
     * 0:年，1:月，2:天
     * @param {date1,date2,type} fps
     */
    dateSub(fps: Array<any>) {
      const size = fps.length;
      let d1 = typeof fps[0] === "number" ? Date.now() : Date.parse(fps[0]);
      let d2 = typeof fps[1] === "number" ? Date.now() : Date.parse(fps[1]);
      let ymd = fps[2];
      if (ymd === 2) {
        //天数
        d1 = d1 - d2;
        return parseInt(d1 / 86400000 + "");
      } else if (ymd === 1) {
        //月
        let y1 = moment(d1).year();
        let m1 = moment(d1).month();
        let y2 = moment(d2).year();
        let m2 = moment(d2).month();
        return (y1 - y2) * 12 + (m1 - m2);
      } else {
        //年
        let y1 = moment(d1).year();
        let y2 = moment(d2).year();
        return y1 - y2;
      }
    }

    dateFormat(d1: string | Date | number, type: number,format:any): string {
      if (type == 93) {
        let n1 = moment(d1).format(GlobalVariable.DATE_FMT_ALL);
        return n1;
      }
      if(!format){
        format = GlobalVariable.DATE_FMT_YMD;
      }
      return moment(d1).format(format);
    }

    makeBipInsAidByStr(str:string,id:string):BipInsAidNew{
        let insAid = new BipInsAidNew(id);
        let cells = new Cells();
        let cels = new Array<Cell>();
        let c1 = new Cell();
        insAid.cl = true
        c1.id = 'code'
        c1.labelString = 'code'
        cels.push(c1)
        let c2 = new Cell();
        c2.id = 'name'
        c2.labelString = 'name'
        cels.push(c2)
        cells.cels = cels;
        insAid.cells = cells;
        let datas:any = []
        let vv:Array<string> = str.split(";")
        vv.forEach((item,index)=>{
            if(item.length>0){
                let _n = item.indexOf(':')
                if(_n>0){
                    let vs = item.split(':')
                    datas.push({code:vs[0],name:vs[1]})
                }else{
                    datas.push({code:index+'',name:item})
                }
            }
        })
        insAid.values = datas
        return insAid;
    }

    getTaskMsgParams(tskim:number,iid:number,state:number,buno:string,buid:string,tousr:string,page:number,size:number,keyword:string) {
        return Object.assign({
            apiId: GlobalVariable.APIID_TA_MSG,
            dbid: BaseVariable.COMM_FLD_VALUE_DBID,
            usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
            tskim:tskim,
            iid:iid,
            state:state,
            buno:buno,
            buid:buid,
            tousr:tousr,
            page:page,
            size:size,
            keyword:keyword,
        });
      }
    
    findMenu(menuId:string){
      let menu = window.sessionStorage.getItem('menulist');
      let m1 =null;
      if(menu!=null){
        let ml = JSON.parse(menu);
        for (let index = 0; index < ml.length; index++) {
          const item = ml[index];
          m1 = this.findMenuById(menuId,item)
          if(m1!=null){
              return m1;
          }
        }
      }else{
        return  null;
      }
      return m1;
    }
    findMenuById(menuId:string,menu:Menu):any{
        if(menu.menuId==menuId){
            return menu
        }else{
            if(menu.haveChild){
                for(let i = 0;i<menu.childMenu.length;i++){
                    let m1 = this.findMenuById(menuId,menu.childMenu[i])
                    if(m1!=null){
                        return m1;
                    }
                }
            }
            return null;
        }
    }
      
  }
  export const baseUtil = new BaseUtil();
}
