import { BIPUtils } from "@/utils/BaseUtil";
import { Cell } from "../pub/coob/Cell";
import { Cells } from "../pub/coob/Cells";
/**
 *ye页面布局文件
 * @export
 * @class BipLayCells
 */
export default class BipLayCells {
  btable: boolean = false;
  start: number = 0;
  endP: number = -1;
  cells: Cells;
  layId: string;
  obj_id: string = "";
  name: string = "";
  uiCels:Array<Cell>;
  bl:number = 0.5;
  constructor(_layId: string, _cells: Cells) {
    this.layId = _layId;
    this.cells = _cells;
    this.uiCels = new Array<Cell>();
    this.init();
    this.makeUICells(_layId);
    this.initBL();
  }
  /**
   *
   *
   * @memberof BipLayCells
   */
  init(): void {
    //@60HT111#40726[-remark]
    let str = this.layId;
    if (str.startsWith("@")) {
      this.btable = false;
      str = str.substring(1);
    } else {
      this.btable = true;
    }
    this.obj_id = BIPUtils.baseUtil.getObjId(str);
    this.name = this.getName(str);
    // let index = str.indexOf("[");
    // if (index > 0) {
    //   let end = str.indexOf("]");
    //   let flds = str.substring(index + 1, end);
    //   // 获取开始和结束下标
    //   index = flds.indexOf("~");
    //   if (index === -1) index = flds.indexOf("-");
    //   if (index === 0) {
    //     this.start = 0;
    //     flds = flds.substring(1);
    //     this.endP = this.findPosition(flds, this.cells);
    //   } else {
    //     let fld = flds.indexOf("~") > -1 ? flds.split("~") : flds.split("-");
    //     this.start = this.findPosition(fld[0], this.cells);
    //     if (fld[1]) {
    //       this.endP = this.findPosition(fld[1], this.cells);
    //     } else {
    //       this.endP = this.cells.cels.length - 1;
    //     }
    //   }
    // } else {
    //   this.start = 0;
    //   this.endP = this.cells.cels.length - 1;
    // }
  }
  /**
   *
   *
   * @param {string} cellId
   * @param {Cells} cells
   * @returns {number}
   * @memberof BipLayCells
   */
  findPosition(cellId: string, cells: Cells): number {
    let index = -1;
    if (this.cells && this.cells.cels) {
      for (let i = 0; i < this.cells.cels.length; i++) {
        let c: Cell = this.cells.cels[i];
        if (c.id === cellId) {
          index = i;
          break;
        }
      }
    }
    return index;
  }
  /**
   *
   *
   * @param {string} str
   * @returns {string}
   * @memberof BipLayCells
   */
  getName(str: string): string {
    let i = str.lastIndexOf("/");
    if (i > 0) {
      let name = str.substring(i + 1);
      return name;
    }
    return "";
  }

  makeUICells(layInfo:string){
    let _startIndex = layInfo.indexOf('[');
    if(_startIndex>-1){
        let laystr = layInfo.substring(_startIndex+1,layInfo.indexOf(']'));
        _startIndex = laystr.indexOf(',')
        while(_startIndex>-1){
            let str1 = laystr.substring(0,_startIndex)
            if(str1.indexOf('-')>-1||str1.indexOf('~')>-1){
                this.findRangeCell(str1);
            }else{
                this.findCellById(str1)
            }

            laystr = laystr.substr(_startIndex+1);
            _startIndex = laystr.indexOf(',')
        }
        if(laystr.indexOf('-')>-1||laystr.indexOf('~')>-1){
            this.findRangeCell(laystr);
        }else{
            this.findCellById(laystr)
        }
    }else{
        this.uiCels = this.cells.cels.filter(item=>{
            return item.attr?(item.attr&0x400)==0:true
        });
    }
  }

  findRangeCell(str1:string){
    let _i = str1.indexOf('-')>-1?str1.indexOf('-'):str1.indexOf('~')
    if(_i==0){
        str1 = str1.substring(1)
        let _ii = this.cells.cels.findIndex(item=>{
        return item.id == str1;
        })
        if(_ii>=0){
            for(let k=0;k<=_ii;k++){
                let cel:Cell = this.cells.cels[k];
                if(cel.attr>0){
                    if((cel.attr&0x400)===0)
                        this.uiCels.push(cel)
                }else
                    this.uiCels.push(cel)
            }
        }
        
    }else{
        let id = str1.substring(0,_i);
        str1 = str1.substring(_i+1)
        let _s = this.cells.cels.findIndex(item=>{
            return item.id == id
        })
        let _e = this.cells.cels.length-1;
        if(str1.length>1){
            _e = this.cells.cels.findIndex(item=>{
                return item.id == str1
            })
        }
        if(_s>=0&&_e>_s){
            for(let k = _s;k<=_e;k++){
                let cel:Cell = this.cells.cels[k];
                if(cel.attr>0){
                    if((cel.attr&0x400)===0)
                        this.uiCels.push(cel)
                }else
                    this.uiCels.push(cel)
            }
        }
        
    }

  }

  findCellById(id:string){
    let _i = this.cells.cels.findIndex(item=>{
        return item.id == id;
    })
    if(_i>-1){
        let cel:Cell = this.cells.cels[_i];
        if(cel.attr>0){
            if((cel.attr&0x400)===0)
                this.uiCels.push(cel)
        }else
            this.uiCels.push(cel)
    }
  }

  initBL(){
    let _i = this.name.indexOf('*')
    if(_i>-1){
        let nn = this.name.substring(_i+1)
        let v = parseFloat(nn)
        if(v<1){
            this.bl = v
        }
    }
    if(_i ==-1){
      _i = this.layId.indexOf('*')
      if(_i>-1){
          let nn = this.layId.substring(_i+1)
          let v = parseFloat(nn)
          if(v<1){
              this.bl = v
          }
      }
    }
  }
}
