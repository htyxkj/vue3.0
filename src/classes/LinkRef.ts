/***
 * 参照对象
 */
// import { BIPUtil } from '@/utils/Request';
// let tool = BIPUtil.ServApi
import QueryCont from './search/QueryCont';
export default class LinkRef{
    id:string //参照ID
    layCells:Array<any> = [] //参照获取的列
    title:string = '' //参照标题
    values:any  //参照值
    showV:string = ''//显示的值
    realV:string = ''//实际的值
    initOK:boolean = false //是否初始化完成
    private bCL:boolean = false //参照对象是常量还是辅助
    private multiple:boolean = false
    // private refId:string = ''
    constructor(_id:string,_bCL:boolean = false,_multiple:boolean = false){
        this.id = _id
        this.bCL = _bCL
        this.multiple = _multiple
        // this.refId =  (this.bCL?'$':'&')+this.id
    }

    ISCL():boolean{
        return this.bCL
    }

    makeShow(){
        if(this.values){
            if(this.bCL){//参照是常量
                this.makeCLRef()
            }else{//参照是辅助
                this.makeAssitRef()
            }
        }else{
            this.showV = this.realV
        }
    }

    makeSearchCont(){
        let cont = ''
        let contAll = [];
        let contOne = [];
        if(this.multiple){
            let type = this.layCells[0].type
            let nn = this.realV.split(';')
            let id = this.layCells[0].id 
            nn.forEach((v1,index)=>{
                let qCont = new QueryCont(id,v1,type);
                qCont.setContrast(0);
                contOne.push(qCont);
                // if(type>=-5 && type<=8){
                //     if(index==0){
                //         cont = `~${id}=${v1}`
                //     }else{
                //         cont += ` or ${id}=${v1}`
                //     }
                // }else{
                //     if(index==0){
                //         cont += `~${id}='${v1}'`
                //     }else{
                //         cont += `or ${id}='${v1}'`
                //     }
                // } 
            })
        }else{
            if(this.id&&this.id.length>0){
                if(this.layCells){
                    let type = (this.layCells.length>0)?this.layCells[0].type:12
                    if(type && this.layCells){
                        // if(type>=-5 && type<=8){
                        //     cont = `~${this.layCells[0].id}=${this.realV}`
                        // }else{
                        //     cont = `~${this.layCells[0].id}='${this.realV}'`
                        // }  
                        let qCont = new QueryCont(this.layCells[0].id,this.realV,type);
                        qCont.setContrast(0);
                        contOne.push(qCont);
                    }
                }

            }
        }
        if(contOne.length ==0){
            return "";
        }else{
            contAll.push(contOne);
            return "~"+JSON.stringify(contAll);
        }
    }

      makeCLRef(){
        if(this.multiple){
            if(this.layCells.length>1){
                let nn = this.realV.split(';')
                let vv1:Array<any> = this.values    
                let vv2:Array<any> = []
                nn.forEach(d1=>{
                    vv1.forEach(item=>{
                        let n1 = item[this.layCells[0].id]
                        if(n1==d1){
                            vv2.push(item)
                        }
                    })
                })
                this.showV="";
                vv2.forEach(item=>{
                    let n1 = item[this.layCells[1].id]
                    this.showV+=(n1?(n1+';'):'')
                })
                if(this.showV)
                    this.showV = this.showV.substring(0,this.showV.length-1)
                else
                    this.showV = this.realV
            }else{
                this.showV = this.realV
            }
        }else{
            if(this.layCells.length>1){
                let vvs:Array<any> = this.values
                vvs.forEach(item=>{
                    let n1 = item[this.layCells[0].id]+''
                    if(n1 == (this.realV+'')){
                        this.showV = item[this.layCells[1].id]
                    }
                })
            }else{
                this.showV = this.realV
            }
        }
    }

    makeAssitRef(){
        if(this.multiple){
            this.showV="";
            if(this.layCells.length>1){
                let vvs:Array<any> = this.values
                vvs.forEach(item=>{
                    let n1 = item[this.layCells[1].id]
                    this.showV+=n1?(n1+';'):''
                })
                if(this.showV)
                    this.showV = this.showV.substring(0,this.showV.length-1)
                else
                    this.showV = this.realV
            }else{
                this.showV = this.realV
            }
        }else{
            if(this.layCells&&this.layCells.length>1){
                if(this.values){
                    if(this.values instanceof Array){
                        if(this.values.length>0){
                            this.showV = this.values[0][this.layCells[1].id]
                            this.showV = this.showV?this.showV:this.realV
                        }else{
                            this.showV = this.values[this.layCells[1].id]
                            this.showV = this.showV?this.showV:this.realV 
                        }
                    }else{
                        this.showV = this.values[this.layCells[1].id]
                        this.showV = this.showV?this.showV:this.realV
                    }
                    // console.log(this.showV)
                }else{
                    this.showV = this.realV
                }
            }else{
                this.showV = this.realV
            }
        }
    }

}