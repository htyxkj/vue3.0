/**
 * 业务对象
 */
export default class Operation extends Object{
    pkfld:string  = 'sid'
    buidfld:string  ='sbuid'
    reffld:string  ='creftimes'
    lkbuidfld:string  ='slkbuid'
    lknofld:string  ='slkid'
    statefld:string  ='state'
    iymfld:string  ='iym'
    hpdatefld:string  ='hpdate'
    sorgfld:string  ='sorg'
    smakefld:string  ='smake'
    buid:string= ''
    pname:string= ''
    bmain:boolean= true
    bnew:boolean= true
    pmenuid:string= ''
    maintb:string= ''
    bulnk:string= ''
    qid:string= ''
    purl:string= ''
    docfld:string= ''
    docfmt:string= ''
    us_mkvou:boolean= false
    us_delvou:boolean= false
    us_gmts:boolean= false
    us_gmerr:boolean= false
    sublnk:string= ''
    procs:string=''
    constructor(){
        super()
    }
}