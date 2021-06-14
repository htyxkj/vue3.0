export class Cell {
  alignment: number = 0;
  assist: boolean = false;
  attr: number = 0;
  ccCharleng: number = 0;
  ccHorCell: number = 1;
  ccLeng: number = 20;
  ccPoint: number = 0;
  ccVerCell: number = 1;
  chkRule: string = "";
  editLink: string = "";
  editName: string = "";
  editType: number = 0;
  id: string = "";
  index: number = 0;
  initValue: string = "";
  isReq: boolean = false;
  isShow: boolean = true;
  labelString: string = "";
  lnk_inn: number = 0;
  parentId: string = "";
  psAutoInc: string = "";
  script: string = "";
  type: number = 12;
  unNull: boolean = true;
  refValue:string=''
  refValues:any
  pRefIds:Array<string> = []
  refCellIds:Array<string> = []
  widthIndex!:number
  rowRefCellId:Array<string> = []//跨行公式中受当前字段影响的字段
  constructor(){}
}
