import { Cells } from "./coob/Cells";
import { Cell } from "./coob/Cell";
import moment from 'moment';
import { GlobalVariable } from '@/utils/ICL';
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
export default class BipScriptProc {
  data: any;
  cells: Cells;
  constructor(data: any, cells: Cells) {
    this.data = data;
    this.cells = cells;
  }
  execute(ogs: string | Array<any>, flag: string, cell: Cell): any {
    return this.executea(ogs, flag, cell);
  }

  executea(ogs: string | Array<string>, flag: string, cell: Cell): any {
    if (!ogs) return null;
    if (typeof ogs === "string") {
      let s0: any = ogs;
      let c0 = s0.charAt(0);
      if (c0 === "~") {
        s0 = s0.substring(1); //;--滤掉上一行的标志
        c0 = s0.charAt(0);
      }
      var xlf = s0.indexOf("\n");
      if (c0 === "<" && s0.charAt(1) === "@") {
        // TODO 上一行运算
      } else if (xlf > 0) {
        // TODO 后续处理
      } else {
        s0 = this.expcalc(s0, true);
        if (s0 instanceof Array) {
          return s0;
        } else return this.keepRound(s0, cell); //;--单行公式
      }
    }
    return ""; //处理其他运算
  }

  expcalc(ogs: string | Array<string>, bds: boolean): any {
    let s0 = ogs;
    if (typeof s0 === "string") {
      s0 = this.bdstovec(s0);
    }
    if (typeof s0 === "object") {
      let bb: any = [];
      return this.expcalc1(s0, bb, 0, s0.length)[0];
    }
    return s0;
  }

  expItem(s0: string, bds: boolean) {
    var x1 = s0 != null ? s0.length - 1 : -1;
    if (x1 < 0) return null;
    if ("null" === s0) return null;
    var b0 = s0 == "true";
    if (b0 || "false" == s0) return new Boolean(b0);
    var c0 = s0.charAt(0);
    var bfh = c0 == "-";
    if (bfh || (c0 >= "0" && c0 <= "9")) {
      if (s0.indexOf(".") > 0) return new Number(s0).valueOf();
      c0 = x1 > 1 ? s0.charAt(1) : "0";
      let x0 = 0,
        ird = 10;
      if (c0 === "X" || c0 === "x") {
        x0 = bfh ? 3 : 2;
        ird = 16; //;--16进制。
      }
      c0 = s0.charAt(x1);
      let bL = c0 === "L" || c0 === "l";
      if (x0 > 0 || bL) {
        s0 = s0.substring(x0, bL ? x1 : x1 + 1);
        if (x0 === 3) s0 = "-" + s0;
      }
      return new Number(s0).valueOf();
    }
    if (bds) {
      if (c0 === "'" && x1 === 2) {
        if (x1 === 2) return s0.charAt(1);
        return this.expItem2(s0, null);
      }
      if (c0 === '"') {
        if (s0.charAt(x1) === '"') {
          return s0.substring(1, x1);
        }
        return this.expItem2(s0, null);
      }
      return this.expItem2(s0, null);
    }
    x1 = c0 >= "A" ? s0.indexOf(".") : 0;
    console.log(s0);
    if (x1 > 0) console.log("varfield");
    //return varfield(s0, x1);
    //getVar(new CVar(s0, -1, null));
    return s0;
  }
  expItem2(s0: string, oins: any) {
    let x0 = s0.length - 1;
    if (
      x0 > 1 &&
      s0.charAt(0) === "$" &&
      s0.charAt(1) === "(" &&
      s0.charAt(x0) === ")"
    ) {
      return s0.substring(2, x0);
    }
    let o0 = this.expItema(s0);
    let s1 = "",
      idx = -1,
      b10 = true,
      bf = false; //bf:是否方法
    let fps = null;
    if ( typeof o0 !== 'string') {
        let sn1:any = o0[1]
        s0 = sn1;
        fps = o0[2];
        let sn2:any = o0[3]
        s1 = sn2;
      if (o0[0] != null) {
          let nn:any = o0[0];
        idx = parseInt(nn.toString());
      }       
      else bf = true;
      b10 = s1 == null || s1.length < 1;
    }
    // console.log(oins);
    if (oins != null)
      // return '00' //TODO 需要添加方法
      return this.expItem6(s0, oins, fps, bf, idx, s1); //;--带实例
    // console.log(o0);
    x0 = s0.indexOf(".");
    if (x0 < 1) {
      if (bf) {
        let fps1: any = fps;
        oins = this.invokefun(s0, fps1);
        return oins;
      }
    }
    return null;
  }

  expItem6(
    sgs: string,
    oins: any,
    fps: any,
    bf: boolean,
    idx: number,
    sgs2: string
  ): any {
    let x0: number = sgs.indexOf(".");
    while (x0 > 0) {
      oins = oins.invokefun(); //执行方法
      if (oins == null) return null;
      sgs = sgs.substring(x0 + 1);
      x0 = sgs.indexOf(".");
    }
    // 是方法
    // if(bf){

    // }
    console.log(sgs, "调用方法");
  }

  invokefun(scf: string, fps: Array<any>) {
    console.log("invokefun", scf);
    let x0 = scf.length;
    if (x0 === 1 && scf.charAt(0) === "M") {
      return this.invokemem(fps);
    }
    if (x0 === 3) {
      if (scf === "var") return this.invokemem(fps);
      if ("def" === scf) {
        let ov = fps[0]; //--为空时启用缺省值。
        if (
          fps.length < 2 ||
          (ov !== null && (typeof ov !== "string" || ov.length > 0))
        ) {
          return ov;
        }
        return fps[1];
      }
    }
    x0 = scf.lastIndexOf(".");
    if (x0 < 0) {
      let fn = eval("this.f_" + scf);
      if (fn) return this.doCallBackFn(fn, [fps]);
      else {
        console.log("没有这个方法:" + scf);
        return null;
      }
    }
  }
  invokemem(fps: Array<any>) {
    let ov = fps[1];
    console.log("invokemem", ov);
    return ov;
  }

  /**
   * 调整日期。
   * 参数：日期,日[天,月,年,小时,分钟]]
   */
  f_dateadd(fps: Array<any>) {
    return baseTool.dateAdd(fps);
  }

  /**
   * 两个日期做减法
   * @param {日期1，日期2，{0:year,1:month,2:day}} fps
   */
  f_datesub(fps: Array<any>) {
    return baseTool.dateSub(fps);
  }

  f_sql(fps: any) {
    let cc = fps.length;
    let sql = "",
      vid = "",
      sf = "";
    if (cc == 1) {
      sql = fps[0];
      vid = "";
      sf = "queryOne";
    } else {
      vid = fps[0];
      sql = fps[1];
      let c0 = vid.charAt(0);
      //;--R=行,C=列,其它字符=单个。
      sf = c0 === "R" ? "queryRow" : c0 === "C" ? "queryCol" : "queryOne";
      vid = vid.length < 2 ? "" : vid.substr(1);
    }
    if (sql.length < 15 && sql.indexOf(" ") < 0) {
      // 长文本中获取sql
      return null;
    }

    // sql = baseTool.formatVarMacro(sql,this.cells,this.data);
    if (sql !== null) {
      return [sql, sf];
    }
    return null;
  }

  doCallBackFn(fn: Function, args: any) {
    var o0 = fn.apply(this, args);
    return o0;
  }

  expItema(s0: string) {
    let il0 = s0.length, x0:number;
    let c0 = '(', cs0 = s0.split('');
    for (x0 = 0;x0 < il0;x0++) {
      c0 = cs0[x0];
      if (c0 === '(' || c0 === '[')
        break;
    }
    if (x0 >= il0)
      return s0;
    var ors = [];
    ors[0] = c0 == '[' ? "1" : null;
    ors[1] = s0.substring(0, x0);
    ors[2] = null;
    ors[3] = null;
    let x1 = baseTool.nextBarcket4(cs0, x0, il0, c0);
    let s1 = s0.substring(x0+1,x1).replace(/(^\s*)|(\s*$)/g, "");
    if (s1.length > 0)
      ors[2] = this.procexpret(s1);//;--参数值
      x1 += 1;
      if (x1 < il0) {
        if (s0.charAt(x1) === '.')
          x1++;//;-调用标识 A().xxxx或a[].bbbb,没有的直接为A()[...]
        ors[3] = s0.substring(x1);//;--更多功能
      }
    return ors;
  }

  /***
   * 处理表达式
   */
  procexpret(s1: string) {
    var ov = this.bdstovec(s1);
    let fps = [];
    let k = 0;
    if (!(ov instanceof String)) {
      let x0 = 0,
        x1 = 0,
        rr = ov.length;
      let bufs = [];
      while (x1 < rr) {
        let o = ov[x1++];
        if (o === ",") {
          bufs = this.expcalc1(ov, bufs, x0, x1 - 1);
          let cc = bufs[0];
          if (cc) {
            fps[k] = cc;
          } else {
            fps[k] = 0;
          }
          x0 = x1;
          k++;
        }
      }
      ov = this.expcalc1(ov, bufs, x0, x1)[0];
    } else ov = this.expItem(ov.toString(), false);
    fps[k] = ov;
    return fps;
  }

  expcalc1(vgs: string[], bufs: Array<any>, x0: number, x1: number) {
    let ov,
      dvs = vgs,
      sv0,
      sv1;
    let cfhs = ["+", "+", "+", "+"],
      cfh;
    let c0: string, c1: string;
    let idx = 0,
      cx0 = 0,
      t1 = 0;
    let bfh = false,
      b0 = false;
    for (var i = x0; i < x1; i++) {
      if (bfh) {
        let cfh = (dvs[i] + "").charCodeAt(0);
        let cc0 = cfh >>> 8;
        c1 = String.fromCharCode(cc0);
        let cc = cfh & 0xff;
        c0 = String.fromCharCode(cc);
        if (c0 == c1) {
          if (c0 == "|" || c0 == "&") {
            for (idx--; idx >= 0; idx--)
              bufs[idx] = baseTool.calcTwoItem(
                bufs[idx],
                bufs[idx + 1],
                cfhs[idx].charCodeAt(0)
              );
            b0 = new Boolean(bufs[0]).valueOf();
            if ((b0 && c0 == "|") || (c0 == "&" && !b0)) return bufs[0];
            idx = 0;
          } else if (c0 == "+" || c0 == "-") {
            this.varIncDes(bufs[idx], c0);
            bfh = false;
          } else {
            cfhs[idx++] = String.fromCharCode(cfh);
          }
        } else {
          cfhs[idx++] = String.fromCharCode(cfh);
        }
      } else {
        ov = dvs[i];
        let ov1: any = ov;
        if (typeof ov1 === 'string') {
          sv0 = ov;
          cfh = sv0.charAt(0);
          if (cfh == "(" || cfh == "[") {
            t1 = sv0.length;
            cx0 = baseTool.nextBarcket4(sv0.split(""), 0, t1, cfh);
            t1--;
            if (cx0 >= t1 || cx0 < 1) {
              sv0 = sv0.substring(1, t1); // [xxxx]
              // console.log(sv0);
              sv1 = null;
            } else {
              sv1 = sv0.substring(cx0 + 2); //[xxxx].方法或其它变量
              sv0 = sv0.substring(1, cx0);
              // console.log(sv0);
            }
            // console.log(cfh);
            ov = cfh == "(" ? this.expcalc(sv0, true) : this.invokeref(sv0);
            if (ov != null && sv1 != null) {
              // 有其他关联
            }
            bufs[idx] = ov;
          } else {
            bufs[idx] = this.expItem(sv0, true);
          }
        } else {
          bufs[idx] = ov;
        }
        if (idx > 1) idx = baseTool.calcItems(bufs, cfhs, idx);
      }
      bfh = !bfh;
    }
    if (!bfh) idx--;
    for (var i = idx - 1; i >= 0; i--)
      bufs[i] = baseTool.calcTwoItem(
        bufs[i],
        bufs[i + 1],
        cfhs[i].charCodeAt(0)
      );
    return bufs;
  }

  invokeref(s0: string) {
    var c0 = s0.charAt(0);
    if (c0 == "&") {
      // 暂时不处理
    }
    var cx = 0,
      t0 = 0;
    var ov = null,
      ors = {};
    var b0 = c0 == "^" || c0 == "<";
    if (b0) {
      // 取父节点数据或者上一行数据
    } else if (c0 >= "a" && c0 <= "z") {
      // 当前数据
      ov = this.data[s0];
      // console.log(ov,'shuju',s0);
      var cell = this.getColumn(s0);
      if (cell) {
        if (cell.type < 12 && cell.type > 1) {
          ov = new Number(ov).valueOf();
        }
      }
    } else {
      ov = s0;
    }
    return ov;
  }

  varIncDes(s0: string, c0: string) {
    console.log("varIncDes");
  }

  bdstovec(ogs: string): any {
    let s0 = ogs;
    var t0 = s0 ? s0.length : 0;
    if (t0 < 1) return [];
    var cs0 = s0.split(""),
      c0 = "0";
    var sFH = "=<>+-*/&|!^%",
      sDIV = sFH + ",;([''";
    var x0 = 0;
    var c1;
    for (x0 = 0; x0 < t0; x0++) {
      c0 = cs0[x0];
      if (sDIV.indexOf(c0) >= 0) break;
    }
    if (x0 >= t0) return s0; //非表达式
    var vgs = new Array();
    var buf = "",
      b0 = false;
    x0 = 0;
    var t1 = t0 - 1;
    for (; x0 < t0; x0++) {
      for (; x0 < t0 && cs0[x0] <= " "; x0++);
      if (x0 >= t0) break;
      b0 = false;
      for (; x0 < t0; x0++) {
        c0 = cs0[x0];
        if (c0 <= " ") break;
        if (c0 == '"' || c0 == "'") {
          var retn = baseTool.nextQuote(buf, cs0, x0, t0, c0);
          x0 = retn[0];
          buf = retn[1];
        } else if (c0 == "(" || c0 == "[") {
          var retn = baseTool.nextBarcket(buf, cs0, x0, t0, c0);
          x0 = retn[0];
          buf = retn[1];
        } else {
          if (c0 == "\\") {
            x0++;
            if (x0 < t0) {
              buf += c0; //;--转义符保留。
              c0 = cs0[x0];
            }
          } else {
            b0 = c0 == "," || c0 == ";";
            if (!b0) {
              b0 = c0 == "-" ? buf.length > 0 : sFH.indexOf(c0) >= 0; //;-处理负数
              if (b0 && x0 < t1) {
                c1 = cs0[x0 + 1];
                if (sFH.indexOf(c1) > -1) {
                    let n1 = (c1.charCodeAt(0)<<8)|c0.charCodeAt(0)
                    c0 = String.fromCharCode(n1);
                //   c0 = (c1 << 8) | c0; //;--复合运算符
                  x0++;
                }
              }
            }
            if (b0) break;
          }
          buf += c0;
        }
      }
      if (buf.length > 0) {
        s0 = buf;
        if ("new" == s0) buf += " ";
        else {
          vgs.push(s0);
          buf = "";
        }
      }
      if (b0) vgs.push(c0);
    }
    return vgs;
  }

  // 四舍五入计算，按照列的小数位数，如果是numeric则进行计算，
  // 其他直接返回原值
  keepRound(v0: any, cell: Cell) {
    if (cell.type < 12 && cell.type > 2) {
      v0 = new Number(v0).toFixed(cell.ccPoint);
      if (isNaN(v0)) {
        v0 = "";
      }
    }else if(cell.type == 91){
        v0 = moment(v0).format(GlobalVariable.DATE_FMT_YMD)
    }
    this.data[cell.id] = v0;
    return v0;
  }

  getColumn(columnName: string) {
    return this.cells.cels.find(cell => cell.id === columnName);
  }
}
