export default class QCopyConf{
    fromID:string = ""
    toId:string = ""
    fromCols:Array<string> = []
    toCols:Array<string> = []
    subs:Array<QCopyConf> = []
    trans:Array<Array<string>> = []
    constructor(){}

    makeTrans(){
        for(let i=0;i<this.trans.length;i++){
            let rfid = this.trans[i]
            let _id = rfid[0]
            let _fid = rfid[1]
            let _index = this.fromCols.findIndex(item=>{
                return item == _id
            })
            if(_index>-1){
                this.toCols[_index] = _fid
            }
        }
        if(this.subs.length>0){
            this.subs.forEach(item=>{
                item.makeTrans()
            })
        }
    }
}