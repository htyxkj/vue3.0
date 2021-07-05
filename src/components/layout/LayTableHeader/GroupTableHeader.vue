<template>
    <div>
        <!-- <template v-for="(item,index) in groupCells">
            <template v-if="!item.child">
                <vxe-table-column header-align="center" align="center" :field="item.id" :key="index"
                    :min-width="widths[item.widthIndex]" :title="item.labelString" show-header-overflow 
                    show-overflow :sortable ="(item.attr&0x400000)>0" :fixed="isFixed(item.widthIndex)" >
                    <template v-slot="{rowIndex}"> 
                        <bip-grid-info :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                    </template>
                </vxe-table-column>
            </template>
            <template v-else-if="item.child.length>0">
                <vxe-table-column :title="item.title" header-align="center" :key="index">
                    <template v-for="(child,idx) in item.child">
                        <group-table-header-a :item="child" :key="idx" :widths="widths" :cds="cds" :fixedColumn="fixedColumn"></group-table-header-a>
                    </template>
                </vxe-table-column>
            </template>
            <template v-else-if="item.child.length == 0">
                <vxe-table-column :title="item.title" header-align="center"  :key="index">
                    <template v-for="(child,idx) in item.cels">
                        <vxe-table-column header-align="center" align="center" :field="child.id" :key="idx"
                            :min-width="widths[child.widthIndex]" :title="child.labelString" show-header-overflow 
                            show-overflow :sortable ="(child.attr&0x400000)>0" :fixed="isFixed(child.widthIndex)" >
                            <template v-slot="{rowIndex}"> 
                                <bip-grid-info :cds="cds" :cell="child" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                            </template>
                        </vxe-table-column> 
                    </template>
                </vxe-table-column>
            </template>
        </template> --> 
        <vxe-table-colgroup field="group0" title="基本信息">
            <vxe-table-column type="seq" width="60"></vxe-table-column>
            <vxe-table-column field="name" title="Name" width="180"></vxe-table-column>
          </vxe-table-colgroup>
          <vxe-table-colgroup field="group1" title="分类信息1">
            <vxe-table-column field="age" title="Age1" width="120"></vxe-table-column>
          </vxe-table-colgroup>
          <vxe-table-colgroup field="group2" title="更多信息">
            <vxe-table-column field="role" title="Role" width="300"></vxe-table-column>
            <vxe-table-column field="attr1" title="Attr1" width="200"></vxe-table-column>
            <vxe-table-colgroup title="详细信息">
              <vxe-table-column field="sex" title="Sex" width="200"></vxe-table-column>
              <vxe-table-column field="num" title="Num" width="200"></vxe-table-column>
            </vxe-table-colgroup>
          </vxe-table-colgroup>
          <vxe-table-colgroup field="group3" title="分类信息2">
            <vxe-table-column field="attr6" title="Attr6" width="120"></vxe-table-column>
          </vxe-table-colgroup>
          <vxe-table-colgroup field="group4" title="额外信息">
            <vxe-table-column field="date3" title="Date" width="140"></vxe-table-column>
            <vxe-table-column field="address" title="Address" width="200" show-overflow></vxe-table-column>
        </vxe-table-colgroup>
    </div>
</template>
<script lang="ts">
/**
 * table 表格表头分组
 */
import { Component, Vue, Prop } from "vue-property-decorator"
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
import CDataSet from "@/classes/pub/CDataSet";
import BipLayCells from "@/classes/ui/BipLayCells";
import GroupTableHeaderA from './GroupTableHeaderA.vue'
@Component({
    components:{BipGridInfo,GroupTableHeaderA}
})
export default class GroupTableHeader extends Vue{
    name:string = "GroupTableHeader"
    @Prop() cds!: CDataSet;
    @Prop() widths?:any
    @Prop() groupCells?:any;
    @Prop() fixedColumn?:any
    @Prop() laycell!: BipLayCells;
    mounted(){
    }
    //固定列
    isFixed(index:number) {
      if (this.cds.ccells.sfix) {
        if (index < this.fixedColumn) {
          return "left";
        }
      }
    }
}
</script>

<style lang="scss">
.bip-lay{
    // width: 100%;
    max-width: 100%;
    .el-form-item__content{
        line-height: 0px !important
    }
}
.bip-number{
    color: rgb(54, 180, 121)
}
.bip-req{
    color: rgb(167, 8, 8)
}
.my-lay-card{
    margin-bottom: 5px;
    .el-card__body{
        padding: 5px;
    }
}
.childBtn{
    text-align: end;
    padding-top: 5px;
    padding-bottom: 5px;
    button{
        width: 120px;
    }
}
</style>

