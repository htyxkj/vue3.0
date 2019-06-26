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
  constructor(_layId: string, _cells: Cells) {
    this.layId = _layId;
    this.cells = _cells;
    this.init();
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
    let index = str.indexOf("[");
    if (index > 0) {
      let end = str.indexOf("]");
      let flds = str.substring(index + 1, end);
      // 获取开始和结束下标
      index = flds.indexOf("~");
      if (index === -1) index = flds.indexOf("-");
      if (index === 0) {
        this.start = 0;
        flds = flds.substring(1);
        this.endP = this.findPosition(flds, this.cells);
      } else {
        let fld = flds.indexOf("~") > -1 ? flds.split("~") : flds.split("-");
        this.start = this.findPosition(fld[0], this.cells);
        if (fld[1]) {
          this.endP = this.findPosition(fld[1], this.cells);
        } else {
          this.endP = this.cells.cels.length - 1;
        }
      }
    } else {
      this.start = 0;
      this.endP = this.cells.cels.length - 1;
    }
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
}
