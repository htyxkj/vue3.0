import { Cells } from "./coob/Cells";
import CData from "./CData";
import { Cell } from "./coob/Cell";
import { billState } from "./BillState";
import { GlobalVariable } from "../../utils/ICL";
import { DateUtils } from "../../utils/DateUtils";
import BipScriptProc from "./BipScriptProc";
import { BIPUtil } from "../../utils/Request";
import QueryEntity from "../search/QueryEntity";
import Operation from "../operation/Operation";
import PageInfo from "../search/PageInfo";
import { BaseI } from "./interface/BaseI";
import { CCalcUI } from "./interface/CCalcUI";
import CRecord from "./CRecord";
let tools = BIPUtil.ServApi;
import { CommICL } from "@/utils/CommICL";
import CeaPars from '../cenv/CeaPars';
let ICL = CommICL;
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
  currRecord: CRecord = new CRecord();
  currRecordArr:Array<CRecord>=[];
  scriptProc: BipScriptProc;
  opera: Operation | null = null;
  page: PageInfo;
  ceaPars!:CeaPars;//审批流信息

  //制单相关的下标
  i_smake: number = -1; //制单人下标
  i_makedate: number = -1; //制单日期下标
  i_hpdate: number = -1; //日期下标
  i_state: number = -1; //状态下标
  i_refs: number = -1; //引用下标

  _total: number = 0; //总数

  hjList: Array<string> = [];

  baseI?: BaseI;

  constructor(_cells: any) {
    this.ccells = _cells;
    this.cdata = new CData("");
    this.page = new PageInfo(1, 10);
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
          n1 += _ds.p_cell + ";";
        }
      }
      let pui = this.ccells.clientUI;
      if (pui) {
        if (pui.indexOf("CCalcUI") > -1) {
          this.baseI = new CCalcUI(this);
        }
      }
      if (n1.length > 0) {
        n1 = n1.substring(0, n1.length - 1);
        this.p_cell = pcell + "(" + n1 + ")";
      } else {
        this.p_cell = pcell;
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
        let statestr = crd.data[cell.id];
        let state: number = parseInt(statestr);
        return state == 0 || state ==1;
      } else {
        return true;
      }
    }
    return false;
  }
  /**
   * 查询单据是否可修改
   * @param _i 数据下标
   */
  currCanEdit(_i: number = -1) {
    //判断是否是临时改
    if(this.ceaPars){
      if(this.ccells.attr)
      if((this.ccells.attr & 0x4000) > 0 && this.ceaPars.statefr !== "6"){
        return true;
      }
    }
    if (this.ds_par != null) {
      return this.ds_par.currCanEdit();
    }
    let crd = this.currRecord;
    if (_i !== -1) {
      crd = this.cdata.getDataAtIndex(_i);
    }
    if (crd) {
      if (this.haveAuth()) {
        if (this.i_state > -1) {
          let cell = this.ccells.cels[this.i_state];
          let statestr = crd.data[cell.id];
          let state: number = parseInt(statestr);
          // if (state == 0) crd.c_state |= 2;
          return state == 0;
        } else {
          // crd.c_state |= 2;
          return true;
        }
      }
    }
    return false;
  }

  haveAuth() {
    let crd = this.currRecord;
    if (this.i_smake > -1) {
      let cell = this.ccells.cels[this.i_smake];
      let smake = crd.data[cell.id];
      let user = tools.getUser();
      if (smake == user.userCode) {
        return true;
      } else {
        return user.attr <= 1;
      }
    }
    return true;
  }

  createRecord(): CRecord {
    let modal = this.createOne();
    // modal.sys_stated = modal | billState.INSERT | billState.EDITED;
    this.addRow(modal);
    this.currRecord = modal;
    this.canEdit = true;
    this.page.currPage = 1;
    this.page.index = this.index;
    this.page.total = this.cdata.data.length;
    return this.currRecord;
  }

  createOne(): CRecord {
    let modal: CRecord = this.initModal(true);
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
    if(cell){
        let id = cell.id
        this.ccells.cels.forEach(col => {
            let scstr = col.script;
            if(scstr){
                let _i = col.refCellIds.findIndex(item=>{
                    return item == id
                });
                
                let vl;
                if(_i>-1){
                    if(scstr && scstr.indexOf("=:") === 0) {
                        scstr = scstr.replace("=:", "");
                        //获取父级字段内容
                        if(col.pRefIds.length >0){
                          if(this.ds_par){
                            vl= this.ds_par.currRecord.data[col.pRefIds[0]]
                          }
                        } else{
                          if(this.scriptProc.data.id != this.currRecord.id){
                            this.scriptProc = new BipScriptProc(this.currRecord, this.ccells);
                          }
                          vl = this.scriptProc.execute(scstr, "", col);
                          if(vl.isNaN || vl == 'NaN')
                            vl = 0;
                        }
                        if (vl instanceof Array) {
                            console.log('公式计算返回数组',vl)
                        } else {
                          if (vl == "Invalid date") {
                            let dd = DateUtils.DateTool.now();
                            if (col.type == 91) {
                              this.currRecord.data[col.id] = DateUtils.DateTool.getDate(
                                dd,
                                GlobalVariable.DATE_FMT_YMD
                              );
                            } else {
                              this.currRecord.data[col.id] = dd;
                            }
                          } else {
                            this.currRecord.data[col.id] = vl;
                          }
                        }
                    }
                    if ((col.initValue && (col.attr & 0x80) > 0) &&  (this.currRecord.c_state & 1)>0) {
                        this.incCalc(this.ccells,this.currRecord);
                    }
                    if((col.attr & 0x2000) >0)
                      this.cellChange(col.id,vl);
                    this.checkGS(col)
                    
                }
            }
        })
        for(var i=0;i<this.ds_sub.length;i++){
          let cd = this.ds_sub[i];
          cd.checkGSByRefId(id);
        }
    }else{
        this.checkAllGS()
    }
  }

  checkAllGS() {
    this.ccells.cels.forEach(col => {
        let scstr = col.script;
        if (scstr && scstr.indexOf("=:") === 0) {
            scstr = scstr.replace("=:", "");
            // 公式计算 
            let vl;
            //获取父级字段内容
            if(col.pRefIds.length >0){
              if(this.ds_par){
                vl= this.ds_par.currRecord.data[col.pRefIds[0]]
              }
            } else{
              if(this.scriptProc.data.id != this.currRecord.id){
                this.scriptProc = new BipScriptProc(this.currRecord, this.ccells);
              }
              vl = this.scriptProc.execute(scstr, "", col);
              if(vl.isNaN || vl == 'NaN')
                vl = 0;
            }
            if (vl instanceof Array) {
            } else {
                if (vl == "Invalid date") {
                    let dd = DateUtils.DateTool.now();
                    if (col.type == 91) {
                        this.currRecord.data[col.id] = DateUtils.DateTool.getDate(
                        dd,
                        GlobalVariable.DATE_FMT_YMD
                        );
                    } else {
                        this.currRecord.data[col.id] = dd;
                    }
                } else {
                    this.currRecord.data[col.id] = vl;
                }
            }
        }
        if (scstr) {
          if (col.initValue && (col.attr & 0x80) > 0) {
            if (col.initValue.indexOf("%") > 0) {
              let scval = "%";
              if (this.currRecord.data[scstr]) {
                scval = this.currRecord.data[scstr];
              }
              console.log(this.currRecord.data[col.id]);
              let vl = col.initValue.replace("%", scval);
              this.currRecord.data[col.id] = vl;
            }
          }
        }
      });
  }

  checkGSByRefId(id:string){
    if(this.cdata && this.cdata.data && this.cdata.data.length>0){
      this.ccells.cels.forEach(col => {
        let scstr = col.script;
        if (scstr && scstr.indexOf("=:") === 0) {
          scstr = scstr.replace("=:", "");
          // 公式计算 
          let vl;
          //获取父级字段内容
          if(col.pRefIds.length >0){
            if(this.ds_par){
              if(col.pRefIds[0] == id){
                vl= this.ds_par.currRecord.data[col.pRefIds[0]]
                let currRecord = this.currRecord;
                for(var j=0;j<this.cdata.data.length;j++){
                  this.currRecord = this.cdata.data[j];
                  this.currRecord.data[col.id] = vl;
                  this.checkGS(col);
                  if(this.currRecord.id == currRecord.id){
                    currRecord = this.currRecord;
                  }
                  this.currRecord.c_state |=2;
                }
                this.currRecord = currRecord;
              }
            }
          }
        }  
      });
    }
  }

  getCell(id: string) {
    return this.ccells.cels.find(item => {
      return id === item.id;
    });
  }

  initModal(isNew: boolean): CRecord {
    // let user = JSON.parse(window.sessionStorage.getItem('user')+'')
    // let deptInfo = user.deptInfo
    if(this.ccells==null)
        return new CRecord();
    // console.log(this.ccells,'fdsfds')
    let xinc = this.ccells.autoInc;
    if (xinc > 0) xinc = xinc - 1;
    let cel = this.ccells.cels[xinc];
    let modal: CRecord = new CRecord();
    modal.c_state = billState.DICT;
    if ((xinc >= 0 && modal.data[cel.id]) || isNew) {
      modal.c_state = modal.c_state | billState.INSERT;
    }
    modal = this.createDataModal(this.ccells, modal);
    if ((modal.c_state & billState.INSERT) > 0) {
      modal = this.incCalc(this.ccells, modal);
    }
    return modal;
  }

  createDataModal(cell: Cells, modal: CRecord): CRecord {
    let user = JSON.parse(window.sessionStorage.getItem("user") + "");
    let deptInfo = user.deptInfo;
    cell.cels.forEach(item => {
      let iniVl = item.initValue;
      if (!iniVl) {
        if (item.type == 12) modal.data[item.id] = "";
        else {
          if (item.id == "state" && item.refValue == "{$D.STATE}") {
            modal.data[item.id] = "0";
          } else {
            modal.data[item.id] = null;
          }
        }
      } else {
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
        if(iniVl.indexOf("[Y-M-D]")>-1){
          iniVl = iniVl.replace("[Y-M-D]",DateUtils.DateTool.now('YYYY-MM-DD'))
        }
        if (iniVl == "[YMD]") {
          iniVl = DateUtils.DateTool.now("YYYYMMDD");
        }
        if(iniVl.indexOf("[YMD]")>-1){
          iniVl = iniVl.replace("[YMD]",DateUtils.DateTool.now('YYYYMMDD'))
        }
        if (iniVl == "[YM]") {
          iniVl = DateUtils.DateTool.now("YYYYMM");
        }
        if(iniVl.indexOf("[YM]")>-1){
          iniVl = iniVl.replace("[YM]",DateUtils.DateTool.now('YYYYMM'))
        }
        if (iniVl == "[Y2M]") {
          iniVl = DateUtils.DateTool.now("YYMM");
        }
        if(iniVl.indexOf("[Y2M]")>-1){
          iniVl = iniVl.replace("[Y2M]",DateUtils.DateTool.now('YYMM'))
        }
        if (iniVl == "[Y-M]") {
          iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YM);
        }
        if(iniVl.indexOf("[Y-M]")>-1){
          iniVl = iniVl.replace("[Y-M]",DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YM))
        }
        if (iniVl == "[Y2-M]") {
          iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_Y2M);
        }
        if(iniVl.indexOf("[Y2-M]")>-1){
          iniVl = iniVl.replace("[Y2-M]",DateUtils.DateTool.now(GlobalVariable.DATE_FMT_Y2M))
        }
        if (iniVl == "[Y]") {
          iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_Y);
        }
        if(iniVl.indexOf("[Y]")>-1){
          iniVl = iniVl.replace("[Y]",DateUtils.DateTool.now(GlobalVariable.DATE_FMT_Y))
        }
        if (item.type <= 5 && item.type != 1) {
          if (!iniVl) iniVl = "";
          else {
            if (item.type == 3) iniVl = parseFloat(iniVl) + "";
            else iniVl = parseInt(iniVl) + "";
          }
        }
        modal.data[item.id] = iniVl ? iniVl : "";
      }
      //获取父级字段内容
      if(item.pRefIds.length >0){
        if(this.ds_par){
          modal.data[item.id] = this.ds_par.currRecord.data[item.pRefIds[0]]
        }
      }
    });
    return modal;
  }

  incCalc(cell: Cells, modal: CRecord): CRecord {
    if (cell) {
        let xinc = -1;
        if (cell.pkindex) xinc = cell.pkindex[0];
        if (xinc >= 0) {
            let cel = cell.cels[xinc];
            let s0 = cel.psAutoInc;
            if (s0 == null || s0 == undefined || s0.length < 1 || cel.type !== 12) {
                let cc = this.cdata.data[this.cdata.data.length - 1];
                if (cc) {
                    let vl = cc.data[cel.id];
                    if (isNaN(vl)) {
                        modal.data[cel.id] = this.cdata.data.length + 1;
                    } else {
                        modal.data[cel.id] = parseInt(vl) + 1;
                    }
                } else {
                    modal.data[cel.id] = this.cdata.data.length + 1;
                }
                return modal;
            }
            let ilnk = cel.lnk_inn;
            s0 = this.incCalc2(cell.cels, s0, ilnk, modal);
            if ((cel.attr & 0x10000) == 0) {
            var x0 = s0.lastIndexOf("%");
            s0 = x0 < 1 ? s0 : s0.substring(0, x0 + 1);
            }
            modal.data[cel.id] = s0;
        } else {
                let cell: Cell = this.getPKInt();
                if (cell && cell.id !== "c_corp")
                    modal.data[cell.id] = this.cdata.data.length + 1 + "";
        }
    }
    return modal;
  }

  incCalc2(cells: Cell[], sinc: string, ilnk: number, modalV: CRecord) {
    let x0 = sinc.indexOf("\r"),
      x1;
    if (x0 > 0) sinc = sinc.substring(0, x0);
    var cc = sinc.charAt(0);
    if (cc == "[") {
      sinc = sinc.substring(1, sinc.length - 1);
    }
    sinc = this.formatVars(sinc);
    // 处理其他关联
    x0 = sinc.indexOf("%");
    if (x0 >= 0) {
      while (x0 >= 0 && ilnk != 0) {
        x1 = (ilnk & 0xff) - 1;
        if (x1 < 0) {
          console.log(sinc + " autoinc innlink(-1)");
        }
        var refCel = cells[x1];
        var vv = modalV.data[refCel.id];
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
  saveData(buid:string='') {
    for (let i = 0; i < this.ds_sub.length; i++) {
      const cds_0 = this.ds_sub[i];
      this.currRecord.subs[i] = cds_0.cdata;
    }
    return tools.saveData(this.currRecord, this.p_cell,buid);
  }

  /**
   * 获取后台数据
   * @param qe 查询数据条件对象
   */
  queryData(qe: QueryEntity) {
    qe.mcont = this.cont;
    return tools.query(qe);
  }
  queryRPTData(qe: QueryEntity) {
    return tools.queryRPT(qe);
  }
  /**
   * @param crd 添加记录，
   * @param clr 是否清空原记录，默认是不清空
   */
  setRecord(crd: CRecord, clr: boolean = false) {
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

  setRecordAtIndex(crd: CRecord, _i: number = -1) {
    this.currRecord = crd;
    if (this.cdata.data.length < _i) {
      this.index = this.cdata.addRecord(crd, -1);
    } else {
      this.cdata.data[_i] = crd;
      this.index = _i;
    }
    let crd1:CRecord = JSON.parse(JSON.stringify(crd))
    if (this.ds_sub.length > 0) {
      for (let i = 0; i < this.ds_sub.length; i++) {
        let cds1 = this.ds_sub[i];
        cds1.clear();
        let _index = crd1.subs.findIndex(item => {
          return item.obj_id == cds1.ccells.obj_id;
        });
        if (_index > -1) {
          let vals = crd1.subs[_index];
          if (vals) {
            cds1.setValues(vals.data, true);
          }
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

  setCData(data: CData) {
    this.clear();
    this.cdata = data; // Object.assign({},data);
    this.page = data.page;
    this.currRecord = data.getDataAtIndex(0);
    if (this.currRecord) {
      if (this.currRecord.subs.length > 0) {
        this.ds_sub.forEach(cd0 => {
          let _i = this.currRecord.subs.findIndex(item => {
            return (item.obj_id = cd0.cdata.obj_id);
          });
          if (_i > -1) {
            cd0.currRecord = cd0.getRecordAtIndex(0);
          }
        });
      }
    }
  }

  setState(state: number) {
    this.currRecord.c_state = state;
    if (this.ds_sub.length > 0) {
      this.ds_sub.forEach(cd0 => {
        cd0.setStateSub(state);
      });
    }
  }

  setStateSub(state: number) {
    this.cdata.data.forEach((crd: CRecord) => {
      crd.c_state = state;
      if (crd.subs.length > 0) {
        crd.subs.forEach(cd0 => {
          cd0.setStateSub(state);
        });
      }
    });
  }

  setStateOrAnd(state: number, bor: boolean = true) {
    if (bor) {
      this.currRecord.c_state |= state;
    } else {
      this.currRecord.c_state &= state;
    }
    if (this.index > -1) this.cdata.data[this.index].c_state = this.currRecord.c_state;
  }

  isPosted(): boolean {
    let bpost = true;
    if ((this.currRecord.c_state & 1) > 0 || (this.currRecord.c_state & 2) > 0)
      bpost = false;
    return bpost;
  }

  clear() {
    this.cdata.clearValues();
    this.currRecord = new CRecord();
    this.index = -1;
    this._total = 0;
    if (this.ds_sub.length > 0) {
      this.ds_sub.forEach(cds => {
        cds.clear();
      });
    }
  }

  private initHJList(): void {
    if (this.ccells) {
      this.ccells.cels.forEach(item => {
        if ((item.attr & 0x2000) > 0) {
          this.hjList.push(item.id);
        }
      });
    }
  }

  cellChange(cellId: string, value: any) {
    if (this.baseI) {
      this.baseI.cellDataChange(this, cellId, value);
    }
    if (this.hjList.length > 0) {
      let vvs: Array<number> = new Array<number>();
      this.cdata.data.forEach(row => {
        let crd: CRecord = row;
        this.hjList.forEach((fld: string, index) => {
          let v = crd.data[fld];
          v = v ? parseFloat(v) : 0;
          let v1 = vvs[index];
          v1 = v1 ? parseFloat(v1 + "") : 0;
          vvs[index] = v + v1;
        });
      });
      if (this.ds_par) {
        this.hjList.forEach((fld: string, index) => {
          let cds: CDataSet = this.ds_par;
          let cel;
          let _i = cds.ccells.cels.findIndex(cell => {
            if(cell.id == fld ){
              cel =cell;
            }
            return cell.id == fld;
          });
          if (_i > -1) {
            cds.currRecord.data[fld] = vvs[index];
            cds.checkGS(cel);
          }
        });
      }
    }

    // const _index = this.hjList.findIndex(id=>{
    //     return id == cellId
    // })
  }
  /**根据obj_id 获取cds */
  getCdsByObjID(obj_id:string){
    let cc = false;
    let cds = null;
    if(this.ds_par){
      cds = this.ds_par;
      cc=true
    }else{
      cds =this;
    }
    while(cc){
      if(cds.ds_par){
        cds = cds.ds_par
      }else{
        cc = false;
      }
    }
    return this.getChildCds(cds,obj_id);
  }
  getChildCds(cds:CDataSet,obj_id:string){

    if(cds.ccells.obj_id == obj_id){
      return cds;
    } 
    for(var i =0;i<cds.ds_sub.length;i++){
      let cd:CDataSet = this.getChildCds(cds.ds_sub[i],obj_id);
      if(cd)
        return cd;
    } 
    return new CDataSet('')
  }
}
