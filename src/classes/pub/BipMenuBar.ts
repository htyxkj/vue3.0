import CDataSet from './CDataSet';
import { BipMenuBtn } from '../BipMenuBtn';
import { CommICL } from "@/utils/CommICL";
export default class BipMenuBar{
    dsm:CDataSet
    menuList:Array<BipMenuBtn>
    search:boolean = false
    initOK:boolean = false
    bcheck:boolean = false
    constructor(attr:number,cds?:any,_repot:boolean = false,pres:any = null){
        this.dsm = cds
        this.menuList = new Array<BipMenuBtn>()
        this.search = _repot
        let presArr = this.initPresArr(pres);
        this.initMenuButton(attr,presArr)
        if(this.dsm){
            this.initOK = true;
        }
    }

    private initMenuButton(menuAttr:number,presArr:any){
        if(menuAttr>0){
            this.menuList.splice(0);
            if((menuAttr&CommICL.B_IADD)>0){
                let name = "新建";
                let hint = "";
                let pres = presArr[CommICL.B_CMD_ADD]
                if(pres){
                    name = pres.name;
                    hint = pres.hint;
                }
                let btn = new BipMenuBtn(CommICL.B_CMD_ADD,name)
                btn.setHint(hint);
                btn.setType("primary");
                btn.setIconFontIcon('EDIT');
                this.menuList.push(btn)
                this.bcheck = true
                if(!this.search){
                    let btn = new BipMenuBtn(CommICL.B_CMD_COPY,"复制")
                    btn.setIconFontIcon('copy');
                    this.menuList.push(btn)
                }
            }
            if((menuAttr&CommICL.B_ISAVE)>0){
                let name = "保存";
                let hint = "";
                let pres = presArr[CommICL.B_CMD_SAVE]
                if(pres){
                    name = pres.name;
                    hint = pres.hint;
                }
                let btn = new BipMenuBtn(CommICL.B_CMD_SAVE,name)
                btn.setHint(hint);
                btn.setType("primary");
                btn.setIconFontIcon('save');
                this.menuList.push(btn)
            }
            if((menuAttr&CommICL.B_IDEL)>0){
                let name = "删除";
                let hint = "";
                let pres = presArr[CommICL.B_CMD_DEL]
                if(pres){
                    name = pres.name;
                    hint = pres.hint;
                }
                let btn = new BipMenuBtn(CommICL.B_CMD_DEL,name)
                btn.setHint(hint);
                btn.setIconFontIcon('delete');
                btn.setType("danger");
                this.menuList.push(btn)
            }
            if((menuAttr&CommICL.B_IWORKEA)>0){
                let name = "提交";
                let hint = "";
                let pres = presArr[CommICL.B_CMD_SUBMIT]
                if(pres){
                    name = pres.name;
                    hint = pres.hint;
                }
                let btn = new BipMenuBtn(CommICL.B_CMD_SUBMIT,name)
                btn.setHint(hint);
                btn.setType("primary");
                btn.setIconFontIcon('tijiao');
                this.menuList.push(btn)
                // btn = new BipMenuBtn(CommICL.B_CMD_CHECK,"审核")
                // btn.setIconFontIcon('sh');
                // this.menuList.push(btn)
                btn = new BipMenuBtn(CommICL.B_CMD_CHECK_PROCESS,"流程查看")
                btn.setIconFontIcon('wenjian6');
                this.menuList.push(btn)
            }
            if((menuAttr&CommICL.B_IFIND)>0){
                this.setNavButton(menuAttr)
            }
        }
    }

    setNavButton(menuAttr:number){
        let btn=null;
        if(this.search){
            // let btn = new BipMenuBtn(CommICL.B_CMD_CLEAR,"清空")
            // btn.setIconFontIcon('zk');
            // this.menuList.push(btn)
        }
        if(!this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_FIND,"查找")
            btn.setIconFontIcon('search');
            this.menuList.push(btn)
        }
        if(((menuAttr&CommICL.B_ISTAT)<=0)&&this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_ISTAT,"统计")
            btn.setIconFontIcon('tongji');
            this.menuList.push(btn)
        }
        if(((menuAttr&CommICL.B_IOUTTX)>0)&&this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_PICTURE,"图形")
            btn.setIconFontIcon('zhexian1');
            this.menuList.push(btn)
        }
        if(((menuAttr&CommICL.B_IFILE)>0)&&this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_IFILE,"导出文件")
            btn.setIconFontIcon('xiazai1');
            this.menuList.push(btn)
        }
        if(this.search){
            // btn = new BipMenuBtn(CommICL.B_CMD_ROWCOLUMN,"列/行")
            // btn.setIconFontIcon('tongji');
            // this.menuList.push(btn)
        }
        if(this.search){
            btn = new BipMenuBtn(CommICL.B_CMD_CONDITIONSHOW,"显示/隐藏(条件)")
            btn.setIconFontIcon('show');
            this.menuList.push(btn)
        }
        if(this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_DESKTOPLIST,"存为桌面组件")
            btn.setIconFontIcon('zhexian1');
            // this.menuList.push(btn)
        }
        if(!this.search){
            btn = new BipMenuBtn(CommICL.B_CMD_FIRST,"首页")
            btn.setIconFontIcon('first-page');
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_PRIOR,"上页")
            btn.setIconFontIcon('up');
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_LIST,"1/1")
            btn.setHasIcon(false);
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_NEXT,"下页")
            btn.setIconFontIcon('next');
            btn.setRight();
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_LAST,"末页")
            btn.setIconFontIcon('last');
            btn.setRight();
            this.menuList.push(btn)
        }
    }
    //初始化菜单参数中的 pres
    initPresArr(pres:any){
        let value:any = {};
        if(pres){
            let presArr = pres.split(";");
            for(var i=0;i<presArr.length;i++){
                let pre = presArr[i];
                let p = pre.split("=");
                let cmd = p[0];
                let vl = p[1]; 
                let msg = "";
                let ps = vl.split("|");
                if(ps.length >=2){
                    vl = ps[0];
                    msg = ps[1];
                }else{
                    vl = ps[0];
                }
                let vv = {name:vl,hint:msg}
                value[cmd]= vv;
            }
        }
        return value;
    }
}