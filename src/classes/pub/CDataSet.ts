import { Cells } from "./coob/Cells";
import CData from "./CData";
import { Cell } from "./coob/Cell";
import { billState } from "./BillState";
import { GlobalVariable } from "@/utils/ICL";
import { DateUtils } from "@/utils/DateUtils";
import BipScriptProc from "./BipScriptProc";
import { BIPUtil } from "@/utils/Request";
import QueryEntity from "../search/QueryEntity";
import Operation from "../operation/Operation";
import PageInfo from '../search/PageInfo';
import { BaseI } from './interface/BaseI';
import { CCalcUI } from './interface/CCalcUI';
let tools = BIPUtil.ServApi;
export default class CDataSet {
  ccells: Cells;
  cdata: CData;
  cont: any = null;
  index: number = -1;
  ds_sub: Array<CDataSet> = new Array<CDataSet>();
  ds_par: any = null;
  p_cell: any = null;
  x_pk: number;
  initOK: boolean = false;
  canEdit: boolean = false;
  currRecord: any = { sys_stated: billState.DICT };
  scriptProc: BipScriptProc;
  opera: Operation | null = null;
  page:PageInfo ;

  //制单相关的下标
  i_smake: number = -1; //制单人下标
  i_makedate: number = -1; //制单日期下标
  i_hpdate: number = -1; //日期下标
  i_state: number = -1; //状态下标
  i_refs: number = -1; //引用下标

  _total: number = 0; //总数

  hjList:Array<string> = [];

  baseI?:BaseI;

  constructor(_cells: any) {
    this.ccells = _cells;
    this.cdata = new CData("");
    this.page = new PageInfo(1,10)
    this.index = -1;
    this.scriptProc = new BipScriptProc(this.currRecord, this.ccells);
    this.x_pk = this.indexPKID(this.ccells, true, true);
    if (_cells) {
      let pcell = this.ccells.obj_id;
      this.cdata = new CData(_cells.obj_id);
      this.ds_sub = new Array<CDataSet>();
      this.initHJList();
      let n1 = "";
      if (_cells.subLayCells) {
        for (let i = 0; i < _cells.subLayCells.length; i++) {
          let _ds: CDataSet = new CDataSet(_cells.subLayCells[i]);
          this.ds_sub[i] = _ds;
          this.ds_sub[i].ds_par = this;
          // console.log(_ds.p_cell);
          n1 += _ds.p_cell + ";";
        }
      }
      let pui = this.ccells.clientUI;
      if(pui){
          if(pui.indexOf('CCalcUI')>-1){
            this.baseI = new CCalcUI(this);
          }
      }
      // console.log(pcell)
      if (n1.length > 0) {
        n1 = n1.substring(0, n1.length - 1);
        this.p_cell = pcell + "(" + n1 + ")";
        // console.log(this.p_cell)
      } else {
        this.p_cell = pcell;
        // console.log(this.p_cell)
      }

      this.initOK = true;
    }
  }
  indexPKID(cell: Cells, bfull: boolean, bcid: boolean): number {
    if (!cell) return 0;
    let cel: Cell;
    let cels: Cell[] = cell.cels;
    let rx: number = -1,
      x0: number = 0,
      cp: number = cell.pkcc,
      xco: number = cell.x_co,
      t0: number = 0,
      t1: number;
    let cc: number = cels.length;
    let atr: number = 0;
    for (let i = 0, cx = 0; cx < cp && i < cc; i++) {
      cel = cels[i];
      atr = cel.attr;
      if ((atr & 1) != 0) {
        if (cel.index != xco) {
          t1 = cel.type;
          if (
            bcid &&
            t1 === 5 &&
            ((cel.attr & 0x800000) != 0 || cel.id === "cid")
          ) {
            return x0; //直接用cid时
          }
          t1 = t1 == 12 ? cel.ccLeng : t1 == 4 ? 4 : 2;
          if (t1 > t0) {
            t0 = t1;
            rx = x0;
          }
        }
        x0++;
        cx++;
      } else if (bfull || (atr & 512) != 0) x0++;
    }
    return rx;
  }

  setOpera(opera: Operation | null) {
    this.opera = opera;
    this.initContrlIndex();
  }

  removeIndex(_i: number) {
    this.cdata.removeIndex(_i);
    this._total -= 1;
  }

  /**
   * 初始化控制参数
   */
  initContrlIndex() {
    if (this.opera) {
      let opr: Operation = this.opera;
      this.i_hpdate = this.ccells.cels.findIndex(item => {
        return item.id === opr.hpdatefld;
      });
      this.i_smake = this.ccells.cels.findIndex(item => {
        return item.id === opr.smakefld;
      });
      this.i_refs = this.ccells.cels.findIndex(item => {
        return item.id === opr.reffld;
      });
      this.i_state = this.ccells.cels.findIndex(item => {
        return item.id === opr.statefld;
      });
    }
  }

  /**
   * 判断当前行能否删除
   */
  canDel(): boolean {
    if (this.haveAuth()) {
      let crd = this.currRecord;
      if (this.i_state > -1) {
        let cell = this.ccells.cels[this.i_state];
        let statestr = crd[cell.id];
        let state: number = parseInt(statestr);
        return state == 0;
      } else {
        return true;
      }
    }
    return false;
  }

  currCanEdit(_i: number = -1) {
    if(this.ds_par!=null){
        return this.ds_par.currCanEdit();
    }
    let crd = this.currRecord;
    if (_i !== -1) {
      crd = this.cdata.getDataAtIndex(_i);
    }
    if (this.haveAuth()) {
      if (this.i_state > -1) {
        let cell = this.ccells.cels[this.i_state];
        let statestr = crd[cell.id];
        let state: number = parseInt(statestr);
        return state == 0;
      } else {
        return true;
      }
    }
    return false;
  }

  haveAuth() {
    let crd = this.currRecord;
    if (this.i_smake > -1) {
      let cell = this.ccells.cels[this.i_smake];
      let smake = crd[cell.id];
      let user = tools.getUser();
      if (smake == user.userCode) {
        return true;
      } else {
        return user.attr <= 1;
      }
    }
    return true;
  }

  createRecord(): object {
    let modal = this.createOne();
    // console.log(modal);
    // modal.sys_stated = modal | billState.INSERT | billState.EDITED;
    this.addRow(modal);
    this.currRecord = modal;
    this.canEdit = true;
    this.page.currPage=1
    this.page.index = this.index
    this.page.total = this.cdata._data.length
    return this.currRecord;
  }

  createOne(): any {
    let modal:any = this.initModal(true);
    // console.log(modal)
    modal = Object.assign({},modal,{'sys_stated': billState.INSERT})
    // modal['sys_stated'] =  billState.INSERT;
    this.scriptProc.data = modal;
    this.checkGS();
    return modal;
  }

  addRow(crecord: any) {
    // crecord.sys_stated = BillState.INSERT | BillState.EDITED;
    this.cdata.addRecord(crecord, -1);
    this.index = this.cdata.index;
    this._total += 1;
    // this.currRecord = crecord;
    // if (
    // (crecord.sys_stated & billState.INSERT) > 0 ||
    // (crecord.sys_stated & billState.EDITED) > 0
    // ){
    //     this.scriptProc.data = crecord;
    //     this.checkGS();
    // }
  }
  checkGS(cell?: Cell) {
    if (cell) {
      const attr = cell.attr;
      if ((attr & 0x100000) > 0) {
        // console.log('多列计算')
        this.checkMulCols(cell);
      }
    }
    // this.scriptProc.data = this.currRecord;
    this.ccells.cels.forEach(col => {
      let scstr = col.script;
      if (scstr && scstr.indexOf("=:") === 0) {
        scstr = scstr.replace("=:", "");
        // 公式计算
        var vl = this.scriptProc.execute(scstr, "", col);
        // console.log(vl,this.currRecord,col.id,scstr);
        // if (vl == 'Invalid date') {
        //   console.log(1231);
        //   vl = "";
        // }
        // console.log(vl);
        if (vl instanceof Array) {
        } else {
          if (vl == "Invalid date") {
            let dd = DateUtils.DateTool.now();
            if (col.type == 91) {
              this.currRecord[col.id] = DateUtils.DateTool.getDate(
                dd,
                GlobalVariable.DATE_FMT_YMD
              );
            } else {
              this.currRecord[col.id] = dd;
            }
          } else {
            this.currRecord[col.id] = vl;
          }
        }
        // this.currRecord[col.id] = vl;
      }
    });
  }
  // 多列计算
  checkMulCols(cell: Cell) {
    let script = cell.script;
    if (script) {
      let scripts = script.split("&");
      let cols = scripts[0].split(",");
      let _indexs = scripts[1].split(",");
      let refValues = cell.refValues;
      let id = this.currRecord[cell.id];
      if(!id){
          return ;
      }
      let refInfo: any;
      if (refValues) {
        if (refValues.value.isArray()) {
        } else {
          refInfo = refValues.value;
        }
      }
      if (refInfo) {
        cols.forEach((col, n) => {
          var vv = refInfo[refValues.cols[_indexs[n]]];
          if (vv) {
            var cl = this.getCell(col);
            if (cl) {
              if (cl.type < 12 && cl.type > 1) {
                vv = new Number(vv).toFixed(cl.ccPoint);
              }
              this.currRecord[col] = vv;
            } else {
              this.currRecord[col] = vv;
            }
          }
        });
      }
    }
  }

  getCell(id: string) {
    return this.ccells.cels.find(item => {
      return id === item.id;
    });
  }

  initModal(isNew: boolean): any {
    // let user = JSON.parse(window.sessionStorage.getItem('user')+'')
    // let deptInfo = user.deptInfo
    let xinc = this.ccells.autoInc;
    if (xinc > 0) xinc = xinc - 1;
    let cel = this.ccells.cels[xinc];
    let modal: any = { sys_stated: billState.DICT };
    if ((xinc >= 0 && modal[cel.id]) || isNew) {
      modal.sys_stated = modal.sys_stated | billState.INSERT;
    }
    modal = this.createDataModal(this.ccells, modal);
    if ((modal.sys_stated & billState.INSERT) > 0) {
      modal = this.incCalc(this.ccells, modal);
    }
    console.log(modal)
    return modal;
  }

  createDataModal(cell: Cells, modal: any) {
    let user = JSON.parse(window.sessionStorage.getItem("user") + "");
    let deptInfo = user.deptInfo;
    cell.cels.forEach(item => {
      let iniVl = item.initValue;
      if(!iniVl){
          if(item.type==12)
            modal[item.id] = ''

      }else{
        if (iniVl == "[!]") {
            iniVl = deptInfo.deptCode;
          }
          if (iniVl == "[$]") {
            iniVl = user.userCode;
          }
          if (iniVl == "[#]") {
            iniVl = deptInfo.cmcCode;
          }
          if ((iniVl == "[Y-M-D]" || iniVl === "0") && item.type === 91) {
            iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YMD);
          }
          if ((iniVl == "[Y-M-D]" || iniVl === "0") && item.type === 93) {
            iniVl = DateUtils.DateTool.now();
          }
          if (iniVl == "[Y-M-D]") {
            iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YMD);
          }
          if (iniVl == "[YMD]") {
            iniVl = DateUtils.DateTool.now("YYYYMMDD");
          }
          if (iniVl == "[YM]") {
            iniVl = DateUtils.DateTool.now("YYYYMM");
          }
          if (iniVl == "[Y2M]") {
            iniVl = DateUtils.DateTool.now("YYMM");
          }
          if (iniVl == "[Y-M]") {
            iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YM);
          }
          if (iniVl == "[Y2-M]") {
            iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_Y2M);
          }
          if (item.type <= 5) {
            if (!iniVl) iniVl = "";
            else {
                if(item.type==3)
                    iniVl = parseFloat(iniVl) + "";
                else
                    iniVl = parseInt(iniVl) + "";
            }
          }
          modal[item.id] = iniVl ? iniVl : "";
      }
    });
    return modal;
  }

  incCalc(cell: Cells, modal: any) {
    if (cell) {
        let xinc =-1;
        if(cell.pkindex)
            xinc = cell.pkindex[0];
        if (xinc >= 0) {
            var cel = cell.cels[xinc];
            var s0 = cel.psAutoInc;
            if (s0 == null || s0 == undefined || s0.length < 1 || cel.type !== 12){
                modal[cel.id] = this.cdata._data.length+1
                return modal;
            }
                
            let ilnk = cel.lnk_inn;
            // console.log('ilink',ilnk);
            s0 = this.incCalc2(cell.cels, s0, ilnk, modal);
            if ((cel.attr & 0x10000) == 0) {
            var x0 = s0.lastIndexOf("%");
            s0 = x0 < 1 ? s0 : s0.substring(0, x0 + 1);
            }
            modal[cel.id] = s0;
        } else {
            let cell: Cell = this.getPKInt();
            if (cell && cell.id !== "c_corp")
                modal[cell.id] = this.cdata._data.length + 1 + "";
      }
    }
    return modal;
  }

  incCalc2(cells: Cell[], sinc: string, ilnk: number, modalV: any) {
    let x0 = sinc.indexOf("\r"),
      x1;
    if (x0 > 0) sinc = sinc.substring(0, x0);
    var cc = sinc.charAt(0);
    if (cc == "[") {
      sinc = sinc.substring(1, sinc.length - 1);
    }
    // console.log(sinc);
    sinc = this.formatVars(sinc);
    // console.log(sinc);
    // 处理其他关联
    x0 = sinc.indexOf("%");
    if (x0 >= 0) {
      while (x0 >= 0 && ilnk != 0) {
        x1 = (ilnk & 0xff) - 1;
        if (x1 < 0) {
          console.log(sinc + " autoinc innlink(-1)");
        }
        var refCel = cells[x1];
        var vv = modalV[refCel.id];
        sinc =
          sinc.substring(0, x0) +
          this.incCalca(refCel, (ilnk >>> 8) & 0xff, vv, x1) +
          sinc.substring(x0 + 1);
        x0 = sinc.indexOf("%", x0);
        ilnk >>>= 16;
      }
    }
    return sinc;
  }

  getPKInt(): any {
    var cell = this.ccells.cels.find(item => {
      return (item.attr & 1) > 0 && item.type < 12;
    });
    return cell;
  }

  incCalca(cel: Cell, iinc: number, orf: string, xdep: any) {
    var t0 = iinc & 0xf0;
    var s0 = "";
    // console.log(cel,iinc,orf,xdep);
    if (t0 == 16) {
      var bbc = orf.match(GlobalVariable.FULLDATE);
      if (bbc == null) orf = DateUtils.DateTool.now();
      if ((iinc & 2) !== 0) {
        s0 += DateUtils.DateTool.getDate(orf, "YY");
      } else if ((iinc & 1) !== 0) {
        s0 += DateUtils.DateTool.getDate(orf, "YYYY");
      }
      if ((iinc & 4) !== 0) {
        s0 += DateUtils.DateTool.getDate(orf, "MM");
      }
      if ((iinc & 8) !== 0) {
        s0 += DateUtils.DateTool.getDate(orf, "DD");
      }
      return s0;
    }
    if (orf == null) return "0";
    s0 = orf + "";
    return s0;
  }

  formatVars(sinc: string) {
    var user = JSON.parse(window.sessionStorage.getItem("user") + "");
    var deptInfo = user.deptInfo;
    sinc = sinc.replace(/\[!\]/g, deptInfo.deptCode);
    sinc = sinc.replace(/\[#\]/g, deptInfo.cmcCode);
    sinc = sinc.replace(/\[$\]/g, user.userCode);
    sinc = sinc.replace(/\[Y2M\]/g, DateUtils.DateTool.now("YYMM"));
    sinc = sinc.replace(/\[YM\]/g, DateUtils.DateTool.now("YYYYMM"));
    sinc = sinc.replace(/\[YMD\]/g, DateUtils.DateTool.now("YYYYMMDD"));
    return sinc;
  }

  /**
   * 保存数据
   */
  saveData() {
      for(let i=0;i<this.ds_sub.length;i++){
          const cds_0 = this.ds_sub[i]
          this.currRecord[cds_0.ccells.obj_id] = cds_0.cdata._data
      }
    return tools.saveData(this.currRecord, this.p_cell);
  }

  /**
   * 获取后台数据
   * @param qe 查询数据条件对象
   */
  queryData(qe: QueryEntity) {
    return tools.query(qe);
  }

  /**
   * @param crd 添加记录，
   * @param clr 是否清空原记录，默认是不清空
   */
  setRecord(crd: any, clr: boolean = false) {
    if (clr) {
      this.cdata.clearValues();
    }
    this.cdata.addRecord(crd, -1);
    this.currRecord = crd;
    this.index = this.cdata.index;
  }

  getRecordAtIndex(_i: number = -1) {
    if (_i === -1) {
      return this.currRecord;
    }
    return this.cdata.getDataAtIndex(_i);
  }

  setRecordAtIndex(crd: any, _i: number = -1) {
    if (this.cdata._data.length < _i) {
      this.cdata.addRecord(crd, -1);
    } else this.cdata._data[_i] = crd;
    console.log(crd);
    if (this.ds_sub.length > 0) {
      for (let i = 0; i < this.ds_sub.length; i++) {
        let cds1 = this.ds_sub[i];
        cds1.clear();
        let vals = crd[cds1.ccells.obj_id];
        if (vals) {
          console.log(vals);
          cds1.setValues(vals, true);
        }
      }
    }
  }

  setValues(values: Array<any>, bfr: boolean = false) {
    if (bfr) {
      this.cdata.clearValues();
    }
    values.forEach(crd => {
      this.cdata.addRecord(crd, -1);
    });
  }

  setState(state: number) {
    this.currRecord.sys_stated = state;
    if(this.ds_sub.length>0){
        this.ds_sub.forEach(cd0=>{
            cd0.setStateSub(state)
        })
    }
  }

  setStateSub(state: number){
    this.cdata._data.forEach((crd:any) => {
        crd.sys_stated = state;
    });
  }

  setStateOrAnd(state: number, bor: boolean = true) {
    if (bor) {
      this.currRecord.sys_stated |= state;
    } else {
      this.currRecord.sys_stated &= state;
    }
  }

  isPosted():boolean{
    let bpost = true
    if((this.currRecord.sys_stated&1)>0||(this.currRecord.sys_stated&2)>0)
        bpost = false
    return bpost
  }

  clear() {
    this.cdata.clearValues();
    console.log(this.cdata._data.length);
    this.index = -1;
    this._total = 0;
    if(this.ds_sub.length>0){
        this.ds_sub.forEach(cds=>{
            cds.clear()
        })
    }
  }

  private initHJList():void{
    if(this.ccells){
        this.ccells.cels.forEach(item=>{
            if((item.attr&0x2000)>0){
                this.hjList.push(item.id)
            }
        })
        console.log(this.hjList)
    }
  }

  cellChange(cellId:string,value:any){
    if(this.baseI){
        this.baseI.cellDataChange(this,cellId,value);
    }
    if(this.hjList.length>0){
        let vvs:Array<number> = new Array<number>();
        this.cdata._data.forEach(row=>{
            let crd:any = row;
            this.hjList.forEach((fld:string,index)=>{
                let v = crd[fld] 
                v = v ? parseFloat(v):0
                let v1 = vvs[index]
                v1 = v1?parseFloat(v1+''):0
                console.log(v1,v,'1111',fld,crd)
                vvs[index]=v+v1
            })
        });
        if(this.ds_par){
            this.hjList.forEach((fld:string,index)=>{
                let cds:CDataSet = this.ds_par;
                let _i = cds.ccells.cels.findIndex(cell=>{
                    return cell.id == fld;
                })
                if(_i>-1){
                    cds.currRecord[fld] = vvs[index]
                }
            })
        }
    }

    
    // const _index = this.hjList.findIndex(id=>{
    //     return id == cellId
    // })
  }
}
