import CDataSet from './CDataSet';
import { BipMenuBtn } from '../BipMenuBtn';
import { CommICL } from "@/utils/CommICL";
import CData from './CData';
export default class BipMenuBar{
    dsm:CDataSet
    menuList:Array<BipMenuBtn>
    search:boolean = false
    initOK:boolean = false
    bcheck:boolean = false
    constructor(attr:number,cds?:any,_repot:boolean = false){
        this.dsm = cds
        this.menuList = new Array<BipMenuBtn>()
        this.search = _repot
        this.initMenuButton(attr)
        let da = new CData("")

        if(this.dsm){
            this.initOK = true;
        }
            
    }

    private initMenuButton(menuAttr:number){
        if(menuAttr>0){
            this.menuList.splice(0);
            if((menuAttr&CommICL.B_IADD)>0){
                let btn = new BipMenuBtn(CommICL.B_CMD_ADD,"新建")
                btn.setIconFontIcon('EDIT');
                this.menuList.push(btn)
                this.bcheck = true
            }
            if((menuAttr&CommICL.B_ISAVE)>0){
                let btn = new BipMenuBtn(CommICL.B_CMD_SAVE,"保存")
                btn.setIconFontIcon('save');
                this.menuList.push(btn)
            }
            if(!this.search){
                let btn = new BipMenuBtn(CommICL.B_CMD_COPY,"复制")
                btn.setIconFontIcon('copy');
                this.menuList.push(btn)
            }
            if((menuAttr&CommICL.B_IDEL)>0){
                let btn = new BipMenuBtn(CommICL.B_CMD_DEL,"删除")
                btn.setIconFontIcon('delete');
                this.menuList.push(btn)
            }
            if((menuAttr&CommICL.B_IWORKEA)>0){
                let btn = new BipMenuBtn(CommICL.B_CMD_SUBMIT,"提交")
                btn.setIconFontIcon('tijiao');
                this.menuList.push(btn)
                btn = new BipMenuBtn(CommICL.B_CMD_CHECK,"审核")
                btn.setIconFontIcon('sh');
                this.menuList.push(btn)
            }
            if((menuAttr&CommICL.B_IFIND)>0){
                this.setNavButton(menuAttr)
            }

            
        }
    }

    setNavButton(menuAttr:number){
        if(this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_CLEAR,"清空")
            btn.setIconFontIcon('zk');
            this.menuList.push(btn)
            
            btn = new BipMenuBtn(CommICL.B_CMD_ROWCOLUMN,"列/行")
            btn.setIconFontIcon('tongji');
            this.menuList.push(btn)
        }
        let btn = new BipMenuBtn(CommICL.B_CMD_FIND,"查找")
        btn.setIconFontIcon('search');
        this.menuList.push(btn)

        if(((menuAttr&CommICL.B_ISTAT)<=0)&&this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_ISTAT,"统计")
            btn.setIconFontIcon('tongji');
            this.menuList.push(btn)
        }
        if(((menuAttr&CommICL.B_IFILE)>0)&&this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_IFILE,"导出文件")
            btn.setIconFontIcon('xiazai1');
            this.menuList.push(btn)
        }
        if(!this.search){
            btn = new BipMenuBtn(CommICL.B_CMD_FIRST,"第一个")
            btn.setIconFontIcon('first-page');
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_PRIOR,"上一条")
            btn.setIconFontIcon('up');
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_LIST,"1/1")
            btn.setHasIcon(false);
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_NEXT,"下一条")
            btn.setIconFontIcon('next');
            btn.setRight();
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_LAST,"最后一个")
            btn.setIconFontIcon('last');
            btn.setRight();
            this.menuList.push(btn)
        }
    }
}