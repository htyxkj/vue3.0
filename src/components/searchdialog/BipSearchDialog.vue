<template>
    <el-dialog class="bip-search" width="50%" :visible.sync="dialogVisible"
        :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
        <span slot="title">
            <div class="el-dialog__title" style="padding-bottom: 15px;border-bottom: solid 1px #D9DFEF;">查询条件</div>
        </span>
        <el-scrollbar style="margin-bottom:0px;  margin-right: 0px;">
            <el-form @submit.native.prevent ref="form" :model="currcont" label-width="100px" size="mini" label-position="left">
                <el-row style="padding: 0px 15px 0px 10px;">
                    <el-col :span="10">
                        <el-row type="flex" justify="state">
                            <el-form-item label="查询条件">
                                <el-select v-model="model" placeholder="请选择查询条件" size="medium">
                                    <el-option
                                        v-for="(item,index) in options"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select> 
                            </el-form-item>
                        </el-row>
                    </el-col>
                    <el-col :span="10">&nbsp;</el-col>
                    <el-col :span="4">
                        <el-row type="flex" justify="end">
                            <el-button type="text" @click="addTJ" size="mini" :disabled="canAdd"><i class="iconfont icon-bip-edit"></i>&nbsp;添加</el-button>
                            &nbsp;&nbsp;
                            <el-button type="text" size="mini" @click="clear" style="color:red"><i class="iconfont icon-bip-delete"></i>&nbsp;清空</el-button>
                        </el-row>
                    </el-col>
                </el-row>
                <el-row v-for="(sitem,index) in searchValues" :key="index" style="margin-top:5px;padding: 0px 15px 5px 10px;">
                    <el-col :span="20">
                        <el-row type="flex" justify="state">
                            <el-form-item  :label="sitem.name">
                                <el-col :span="10" :xs="10" :sm="10" :md="10">
                                    <bip-comm-editor :cell="sitem.cell" :bgrid="false" :cds="tjCell1" :row="0" />                                    
                                    <!-- <el-input v-model="sitem.v1" size="small" :clearable="true" style="width: 100%;"></el-input> -->
                                </el-col>
                                <el-col class="line" :span="1">~</el-col>
                                <el-col :span="10" :xs="10" :sm="10" :md="10">
                                    <bip-comm-editor :cell="sitem.cell" :bgrid="false" :cds="tjCell2" :row="0" />
                                    <!-- <el-input v-model="sitem.v2" size="small" :clearable="true" style="width: 100%;"></el-input> -->
                                </el-col>
                            </el-form-item>
                        </el-row>
                    </el-col>
                    <el-col :span="4">
                        <el-row type="flex" justify="end">
                            <el-button type="text" size="mini" @click="deleteItem(sitem)" style="color:red"><i class="iconfont icon-bip-delete"></i>&nbsp;删除</el-button>
                        </el-row>
                    </el-col>
                </el-row> 
            </el-form>
        </el-scrollbar>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
            &nbsp;
            <el-button type="primary" @click="searchOK" size="mini">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import { Cells } from "@/classes/pub/coob/Cells";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
@Component({
   components:{}
})
export default class BipSearchDialog extends Vue {
    @Prop() cds_cont!: CDataSet;
    @Provide() dialogVisible: boolean = false;
    @Provide() currcont: any = {};
    @Provide() model: any = "";
    @Provide() options: Array<any> = [];
    @Provide() searchValues: Array<SearchEntity> = [];
    @Provide() cells:Array<any> = []
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;

    
    tjCell1:CDataSet= new CDataSet("");
    tjCell2:CDataSet= new CDataSet("");
    async mounted() {
        if (this.cds_cont) {
            this.tjCell1 = await this.getCell(this.cds_cont.ccells.obj_id)
            this.tjCell2 = await this.getCell(this.cds_cont.ccells.obj_id)
            this.tjCell1.createRecord();
            this.tjCell2.createRecord();
            for(let k in this.tjCell2.currRecord.data){
                this.tjCell1.currRecord.data[k] = "";
                this.tjCell2.currRecord.data[k] = "";
            }
            this.cells = this.tjCell1.ccells.cels;
            this.options.slice(0);
            this.cells.forEach(item => {
                if (item.isShow) {
                    let oo = { value: item.id, label: item.labelString};
                    this.options.push(oo);
                }
            });
        }
    }
    open() {
        this.dialogVisible = true;
    }
    async addTJ(){
        let nn = this.cells.filter(item=>{
            return item.id === this.model
        })[0]
        let cc = Object.assign({},nn);
        cc.isReq = false;
        cc.ccHorCell = this.tjCell1.ccells.widthCell
        if((cc.attr &(0x40))>0)
            cc.attr = cc.attr ^ (0x40)
        let s1 = new SearchEntity(cc)
        s1.cell.labelString="";
        let str = s1.cell.refValue
        if(str){
           if(str.indexOf('&')>0){
                str = str.substr(str.indexOf('&')+1,-str.indexOf('&')+str.indexOf("}")-1);
                let aidMarkKey = this.cds_cont.ccells.obj_id + "_" + s1.cell.id+'_'+str;
                let vars = {id:200,aid:str,ak:aidMarkKey}
                let res = await this.fetchInsAid(vars);
                if(res.data.id ==0){
                    let bType = res.data.data.data.bType
                    if(bType == 'CGroupEditor'){
                        let groupFld = res.data.data.data.groupFld
                        let grcell = this.cells.filter(item=>{
                            return item.id === groupFld
                        })[0]
                        let _grcell = Object.assign({},grcell);
                        _grcell.isReq = false;
                        _grcell.ccHorCell = this.tjCell1.ccells.widthCell
                        if((_grcell.attr &(0x40))>0)
                            _grcell.attr = _grcell.attr ^ (0x40)
                        let sgr = new SearchEntity(_grcell)
                        sgr.cell.labelString="";
                        this.searchValues.push(sgr);
                    }
                }
           }
        }
        this.searchValues.push(s1);
    }

    deleteItem(sitem:any){
        this.tjCell1.currRecord.data[sitem.id] = null;
        this.tjCell2.currRecord.data[sitem.id] = null;
        this.searchValues = this.searchValues.filter(item=>{return item.id != sitem.id})
    }

    clear(){
        this.searchValues = []
    }

    get canAdd(){
        if(this.model){
            let nn = this.searchValues.filter(item=>{
                return item.id === this.model
            })
            if(nn.length>0){
                return true;
            }
            return false;
        }
        return true;
    }

    searchOK(){
        let contrecord:any = {}
        this.searchValues.forEach(item=>{
            item.v1 = this.tjCell1.currRecord.data[item.cell.id];
            item.v2 = this.tjCell2.currRecord.data[item.cell.id];
            let con = item.v1+'~'+item.v2
            if(con !== '~'){
                if(!con.startsWith('~')){
                    if(item.v2===''){
                        con = con.substring(0,con.length-1)
                    }
                }
                contrecord[`${item.id}`] = con
            }
        })
        this.dialogVisible = false
        this.$emit('makeOK',contrecord)
    }

    async getCell(cellid:string){
        let res = await tools.getCCellsParams(cellid); 
        let rtn: any = res.data; 
        if (rtn.id == 0) {
        let kn: Array<Cells> = rtn.data.layCels;
        let cells = kn; 
            return new CDataSet(cells[0]);  
        }else{
            return new CDataSet('');
        }
    }
}
</script>

