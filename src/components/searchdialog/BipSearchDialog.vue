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
                                <el-select v-model="model" placeholder="请选择查询条件" size="small">
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
                                    <el-input v-model="sitem.v1" size="small" :clearable="true" style="width: 100%;"></el-input>
                                </el-col>
                                <el-col class="line" :span="1">~</el-col>
                                <el-col :span="10" :xs="10" :sm="10" :md="10">
                                    <el-input v-model="sitem.v2" size="small" :clearable="true" style="width: 100%;"></el-input>
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
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import BipSearchCommEditor from '@/components/searchEditorn/BipCommEditor.vue'
@Component({
   components:{BipSearchCommEditor}
})
export default class BipSearchDialog extends Vue {
    @Prop() cds_cont!: CDataSet;
    @Provide() dialogVisible: boolean = false;
    @Provide() currcont: any = {};
    @Provide() model: any = "";
    @Provide() options: Array<any> = [];
    @Provide() searchValues: Array<SearchEntity> = [];
    @Provide() cells:Array<any> = []
    mounted() {
        if (this.cds_cont) {
            this.cells = this.cds_cont.ccells.cels;
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
    addTJ(){
        let nn = this.cells.filter(item=>{
            return item.id === this.model
        })[0]
        let s1 = new SearchEntity(nn)
        this.searchValues.push(s1);
    }

    deleteItem(sitem:any){
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
        let bok:boolean = false
        this.searchValues.forEach(item=>{
            let con = item.v1+'~'+item.v2
            if(con !== '~'){
                if(!con.startsWith('~')){
                    if(item.v2===''){
                        con = con.substring(0,con.length-1)
                    }
                }
                contrecord[`${item.id}`] = con
                bok = true
            }
        })
        this.dialogVisible = false
        this.$emit('makeOK',bok,contrecord)
    }
}
</script>

