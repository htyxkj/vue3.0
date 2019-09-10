<template>
    <el-dialog :title="bipInsAid.title" class="bip-query" :visible.sync="visible" :append-to-body="true" 
    :close-on-press-escape="true" :close-on-click-modal="false" width="30%" >
    <!-- <div style="height:200px;"> -->
        <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
        <el-scrollbar style="margin-bottom:0px;  margin-right: 0px; height:200px;">
            
                <el-tree class="filter-tree" :data="data" node-key="id"
                    :props="defaultProps" accordion
                    :filter-node-method="filterNode" style="height:80%" icon-class="iconfont icon-bip-wenjianjia4"
                    ref="tree"></el-tree>
        </el-scrollbar>
    <!-- </div> -->
    
         <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="close">取 消</el-button>   
            <el-button size="small" type="info" @click="find">查 找</el-button>
            <el-button size="small" type="primary" @click="selectOK">选中并关闭</el-button>    
        </span>
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipInsAidNew from '@/classes/BipInsAidNew';
import { Cells } from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';

import { BIPUtil } from "@/utils/Request";
import QueryEntity from '../../../classes/search/QueryEntity';
let tools = BIPUtil.ServApi;
@Component({
})
export default class BipTreeInfo extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() row!:number

    @Provide() visible:boolean = false

    @Provide() defaultProps:any= {}
    @Provide() data:any= []
    @Provide() filterText:any = ''
    @Provide() count:number = 0
    mounted(){
        this.defaultProps = {
          children: 'children',
          label: 'label'
        }

        // this.data = [{
        //   id: 1,
        //   label: '一级 1',
        //   children: [{
        //     id: 4,
        //     label: '二级 1-1',
        //     children: [{
        //       id: 9,
        //       label: '三级 1-1-1'
        //     }, {
        //       id: 10,
        //       label: '三级 1-1-2'
        //     }]
        //   }]
        // }, {
        //   id: 2,
        //   label: '一级 2',
        //   children: [{
        //     id: 5,
        //     label: '二级 2-1'
        //   }, {
        //     id: 6,
        //     label: '二级 2-2'
        //   }]
        // }, {
        //   id: 3,
        //   label: '一级 3',
        //   children: [{
        //     id: 7,
        //     label: '二级 3-1'
        //   }, {
        //     id: 8,
        //     label: '二级 3-2'
        //   }]
        // }]

    }


    @Watch('filterText')
    filterTextChange(val:any) {
        let ref:any = this.$refs.tree;
        ref.filter(val);
    }
    open(){
        this.visible = true;
        console.log('32131')
        this.count++;
        if(this.count<2)
            this.find()
        console.log('32131',this.count)
    }   
    find(){
        let aid = this.bipInsAid.id
        let qe = new QueryEntity("","")
        tools.getBipInsAidInfo(aid, 210,qe).then(res=>{
            console.log(res);
            let d0 = res.data;
            if(d0.id==0){
                let data = d0.data.data
                console.log(data);
                this.data = data;
            }
        })
    }

    close(){
        this.visible = false
    }

    selectOK(){

    }

    filterNode(value:any, data:any) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      }


    
}
</script>