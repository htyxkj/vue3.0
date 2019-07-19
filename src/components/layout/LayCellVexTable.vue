<template>
    <div v-if="laycell" class="bip-lay">
        <!-- 单据录入表格-->
        <vxe-table
            ref="_vvt"
            v-if="beBill"
            border
            size="small"
            highlight-hover-row
            show-all-overflow="tooltip"
            show-header-all-overflow
            class="vxe-table-element"
            :data.sync="cds.cdata._data"
            :optimized="true"
            :edit-config="{key:`${id}`,trigger: 'click', mode: 'cell',showStatus: true,showIcon:false,activeMethod:activeMethod}"
            resizable
            @edit-actived="rowActive"
            @edit-closed="editClose"
            height="300px"
            :selectRow="cds.currRecord"
            >
            <!-- <vxe-table-column type="selection" width="60"></vxe-table-column> -->
            <vxe-table-column
                header-align="center"
                align="center"
                v-for="(cel,index) in laycell.uiCels"
                :key="index"
                :prop="cel.id"
                :width="widths[index]"
                :label="cel.labelString"
                show-header-overflow
                :edit-render="{name: 'default'}"
                show-overflow
                :disabled="(cel.attr&0x40)>0"
            >
                <template v-slot:edit="{row,rowIndex}">
                    <bip-comm-editor  :cell="cel" :cds="cds" :row="rowIndex" :bgrid="true"/>
                    <!-- <bip-grid-input-lay
                        :cds="cds"
                        :cell="cel"
                        :index="rowIndex"
                        :bill="beBill"
                        :row="row"
                    ></bip-grid-input-lay> -->
                </template>
                <template v-slot="{row,rowIndex}">
                    <bip-grid-info
                        :cds="cds"
                        :cell="cel"
                        :row="rowIndex"
                        :bgrid="true"
                    ></bip-grid-info>
                </template>
            </vxe-table-column>
        </vxe-table>
        <!-- 报表展示表格-->
        <vxe-table
            ref="_vvt"
            v-else
            border
            resizable
            size="small"
            highlight-hover-row
            show-all-overflow="tooltip"
            show-header-all-overflow
            class="vxe-table-element"
            :data.sync="cds.cdata._data"
            :optimized="true"
            height="300px"
            @cell-dblclick="openrefs"
            >
            <vxe-table-column type="index" width="60"></vxe-table-column>
            <vxe-table-column
                header-align="center"
                align="center"
                v-for="(cel,index) in laycell.uiCels"
                :key="index"
                :prop="cel.id"
                :width="widths[index]"
                :label="cel.labelString"
                show-header-overflow
                show-overflow
            >
                <template v-slot="{row,rowIndex}">
                    <!-- <bip-grid-cell-info
                        :cds="cds"
                        :cell="cel"
                        :index="rowIndex"
                        :bill="beBill"
                        :row="row"
                    ></bip-grid-cell-info> -->

                    <bip-grid-info
                        :cds="cds"
                        :cell="cel"
                        :row="rowIndex"
                        :bgrid="true"
                    ></bip-grid-info>
                </template>
            </vxe-table-column>
        </vxe-table>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="cds.page.currPage"
            :page-size="cds.page.pageSize"
            :page-sizes="[10, 20, 30,40,50]"
            layout="slot,total,prev, pager, next,sizes"
            :total="cds.page.total"
        >
        <el-col :span="4" :xs="4" :sm="4" :md="4">
            <el-button-group size="small" v-if="cds.ds_par">  
                <el-button icon="el-icon-edit" @click="addRecord"></el-button>
                <el-button icon="el-icon-share"></el-button>
                <el-button icon="el-icon-delete"></el-button>
            </el-button-group>
        </el-col>
        </el-pagination>

    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import BipLayCells from "@/classes/ui/BipLayCells";
import { Cell } from "@/classes/pub/coob/Cell";
import CCliEnv from "@/classes/cenv/CCliEnv";
import CDataSet from "@/classes/pub/CDataSet";
import BipGridInfo from "../editorn/grid/BipGridInfo.vue";


import { BIPUtil } from "@/utils/Request"; 
let tools = BIPUtil.ServApi
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Menu } from "@/classes/Menu";
@Component({
    components: {  BipGridInfo }
})
export default class LayCelVexTable extends Vue {
    @Prop() laycell!: BipLayCells;
    @Prop() env!: CCliEnv;
    @Provide() info: string = "infos";
    @Provide() clearable: boolean = true;
    @Provide() tableData: Object[] = [];
    @Provide() cds: CDataSet = new CDataSet(null);
    @Provide() widths: Array<string> = new Array<string>();
    // @Provide() status1:Array<Array<any>> = []
    @Provide() beBill: boolean = true;

    @Provide() id: string = "";
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;

    created() {
        this.initWidth();
        if (this.env) {
            this.cds = this.env.getDataSet(this.laycell.obj_id);
            this.beBill = this.env.uriParams.beBill;
            if(this.cds.x_pk>-1)
                this.id = this.laycell.cells.cels[this.cds.x_pk].id;
            if (!this.id) {
                this.id = this.laycell.cells.cels[0].id;
            }
        }
    }


    addRecord() {
        this.cds.createRecord();
    }

    initWidth() {
        if (this.laycell) {
            this.laycell.uiCels.forEach(cel => {
                if (cel.isShow) {
                    let w1 = cel.ccCharleng;
                    if (!cel.id.startsWith("cid")) {
                        w1 = w1 < 10 ? 8 : w1;
                    }
                    let w = w1 * 9 + 20;
                    if (w > 200) w = 200;
                    this.widths.push(w + "");
                }
            });
        }
    }

    getNumChar(cell: any): number {
        let cn = cell.ccCharleng;
        return cn;
    }

    rowActive(rowInfo: any, event: any) {
        this.cds.currRecord = this.cds.getRecordAtIndex(rowInfo.rowIndex);
        this.cds.index = rowInfo.rowIndex;
    }

    editClose(rowInfo: any, event: any) {
        this.cds.currRecord = this.cds.getRecordAtIndex(rowInfo.rowIndex);
    }

    activeMethod() {
        return true;
    }

    handleSizeChange(value: number) {
        if((this.cds.currRecord['sys_stated']&1)>0){
            return ;
        }
        this.cds.cdata.clearValues();
        this.$emit("handleSizeChange", value);
    }

    handleCurrentChange(value: number) {
         if((this.cds.currRecord['sys_stated']&1)>0){
            return ;
        }
        this.cds.cdata.clearValues();
        this.$emit("handleCurrentChange", value);
    }

    async openrefs(data:any,event:any){
        let row = data.row
        let rowIndex = data.rowIndex
        let columnIndex = data.columnIndex
        if(columnIndex > 0){
            let cell = this.laycell.uiCels[columnIndex-1]
            if( (cell.attr & 1) >0 || (cell.attr & (0x80000)) >0 ) { // 0主键   0x80000关联
                let slkid = row[cell.id];
                if ((cell.attr & 0x80000) > 0) {//关联
                    let allCels = this.laycell.cells.cels;
                    let slkbuidCell = null;
                    for(var i=0;i<allCels.length;i++){
                        let oneCel = allCels[i];
                        if(oneCel.id == cell.id){
                            slkbuidCell = allCels[i+1];
                            break;
                        }
                    } 
                    let slkbuid = ''
                    if(slkbuidCell)
                        slkbuid = row[slkbuidCell.id];
                    let data = null;//获取常量定义的 BL_菜单号_字段ID 进行菜单打开
                    if(data == null){
                        if (slkid && slkbuid) { 
                            //获取业务定义
                            let param = await tools.getBULinks(slkbuid);
                            if(param.data.id ==0){
                                let opera = param.data.data.opt;
                                if (opera&&!opera.pmenuid) {
                                    this.$notify.error("业务" + slkbuid + "没有绑定菜单!"); 
                                    return false;
                                }
                                let me = null; 
                                for(let i = 0;i<this.menusList.length;i++){
                                    let m1 = this.findMenuById(opera.pmenuid,this.menusList[i])
                                    if(m1!=null){
                                        me = m1
                                        break ;
                                    }
                                } 
                                if (!me) {
                                    this.$notify.error( "没有" + opera.pmenuid + "菜单权限!" );
                                    return false;
                                }else{
                                    let command = me.command.split("&");
                                    let pbuid = command[0].split("=");
                                    let pmenuid = command[1].split("="); 
                                    this.$router.push({
                                        path:'/layout',
                                        name:'layout',
                                        params:{pkfld:opera.pkfld,value:slkid},
                                        query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                                    })
                                }
                            }  
                        }
                    }else{

                    }
                }else{
                    console.log('主键点击')
                }
            }
        }
    }
    findMenuById(menuId:string,menu:Menu):any{
        if(menu.menuId==menuId){
            return menu
        }else{
            if(menu.haveChild){
                for(let i = 0;i<menu.childMenu.length;i++){
                    let m1 = this.findMenuById(menuId,menu.childMenu[i])
                    if(m1!=null){
                        return m1;
                    }
                }
            }
            return null;
        }
    }
}
</script>

<style>
/* .bip-lay {
    width: 100%;
    max-width: 100%;
}
.bip-number {
    color: rgb(54, 180, 121);
}
.bip-req {
    color: rgb(167, 8, 8);
} */
</style>

