import { Cell } from "./Cell";
export class Cells {
  attr: number = 0;
  autoInc: number = 1;
  canAppend: boolean = true;
  cels: Array<Cell> = [];
  desc: string = "";
  editble: boolean = true;
  haveChild: boolean = true;
  index: number = 0;
  obj_id: string = "";
  parentId!: string;
  pkcc: number = 0;
  pkid: Number = 0;
  pkindex!: number[];
  readOnly: boolean = false;
  subLayCells!: Cells[];
  unNull: boolean = false;
  x_co: number = -1;
  widthCell:number = 4
  x_pk:number = 0
  condiction!:string //扩充条件和固定条件
  clientUI?:string
  sfix!:string
  constructor() {}
}
