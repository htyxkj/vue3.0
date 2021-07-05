<template>
    <div>
        <template v-if="!item.child">
            <vxe-table-column header-align="center" align="center" :field="item.id"
                :min-width="widths[item.widthIndex]" :title="item.labelString" show-header-overflow 
                show-overflow :sortable ="(item.attr&0x400000)>0" :fixed="isFixed(item.widthIndex)" >
                <template v-slot="{rowIndex}"> 
                    <bip-grid-info :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                </template>
            </vxe-table-column>
        </template>
        <template v-else-if="item.child.length>0">
            <vxe-table-column :title="item.title" header-align="center">
                <template v-for="(child,index) in item.child">
                    <group-table-header-b :item="child" :key="index" :widths="widths" :cds="cds" :fixedColumn="fixedColumn"></group-table-header-b>
                </template>
            </vxe-table-column>
        </template>
        <template v-else-if="item.child.length == 0">
            <vxe-table-column :title="item.title" header-align="center">
                <template v-for="(child,index) in item.cels">
                    <vxe-table-column header-align="center" align="center" :field="child.id" :key="index"
                        :min-width="widths[child.widthIndex]" :title="child.labelString" show-header-overflow 
                        show-overflow :sortable ="(child.attr&0x400000)>0" :fixed="isFixed(child.widthIndex)" >
                        <template v-slot="{rowIndex}"> 
                            <bip-grid-info :cds="cds" :cell="child" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                        </template>
                    </vxe-table-column> 
                </template>
            </vxe-table-column>
        </template>
    </div>
</template>
<script lang="ts">
/**
 * table 表格表头分组
 */
import { Component, Vue, Prop } from "vue-property-decorator"
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
import CDataSet from "@/classes/pub/CDataSet";
import GroupTableHeaderB from './GroupTableHeaderB.vue'
@Component({
    components:{BipGridInfo,GroupTableHeaderB}
})
export default class GroupTableHeaderA extends Vue{
    name:string = "GroupTableHeaderA"
    @Prop() item?:any
    @Prop() cds!: CDataSet;
    @Prop() widths?:any
    @Prop() fixedColumn?:any
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

