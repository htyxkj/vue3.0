import { URIParams } from '../URIParams';
import { Cells } from '../pub/coob/Cells';
import BipMenuBar from '../pub/BipMenuBar';
import CDataSet from '../pub/CDataSet';

export default class CCliEnv{
    uriParams: URIParams = new URIParams()
    cells:Array<Cells> = new Array<Cells>()
    mbs:BipMenuBar = new BipMenuBar(0)
    dsm:CDataSet = new CDataSet(null)
    ds_cont:CDataSet = new CDataSet(null)
    ds_ext:Array<CDataSet> = Array<CDataSet>()
    dsmcurr:CDataSet = this.dsm;
    constructor(){}

    initInfo(_uriParams:URIParams,_cells:Array<Cells>,_mbs:BipMenuBar,_dsm:CDataSet,_ds_ext:Array<CDataSet>){
        this.uriParams = _uriParams
        this.cells = _cells
        this.mbs = _mbs
        this.dsm = _dsm
        this.ds_ext = _ds_ext
        this.dsmcurr = new CDataSet("");
    }
    getDataSet(obid:string):any{
        if(obid==='' || this.dsm.ccells.obj_id === obid){
            return this.dsm
        }
        let cds = null
        if(this.dsm.ds_sub){
            for(let i = 0; i<this.dsm.ds_sub.length;i++){
                let cds0:CDataSet = this.dsm.ds_sub[i];
                cds = this.getCDataSet(cds0,obid)
                if(cds!=null){
                    return cds
                }
            }
        }
        if(cds==null){
            if(this.ds_ext){
                for(let i = 0; i<this.ds_ext.length;i++){
                    let cds0:CDataSet = this.ds_ext[i];
                    cds = this.getCDataSet(cds0,obid)
                    if(cds!=null){
                        return cds
                    }
                }
            }
        }
        if(cds == null){
            if(this.ds_cont){
                cds = this.getCDataSet(this.ds_cont,obid)
                if(cds!=null){
                    return  cds
                }
            }
        }
        return cds
    }

    getCDataSet(cds:CDataSet,obid:string):any{
        let cds1 = null
        if(cds.ccells.obj_id === obid)
            return cds
        if(cds.ds_sub){
            for(let i = 0; i<cds.ds_sub.length;i++){
                let cds0:CDataSet = cds.ds_sub[i];
                cds1 = this.getCDataSet(cds0,obid)
                if(cds1 != null){
                    return cds1
                }
            } 
        }
        return cds1
    }
}