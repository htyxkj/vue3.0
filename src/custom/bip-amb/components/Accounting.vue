<template> 
    <div>
        <el-select v-model="amb_purposes_id" placeholder="请选择" size="small">
            <el-option v-for="item in amb_purposes_val" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
    </div>    
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
@Component({
    components: {
    }
})
//核算目的
export default class Accounting extends Vue {
    amb_purposes_id:string = "";//核算id
    amb_purposes_val:Array<any> = new Array<any>();
    jsonData:any ={};
    async created() {
        this.jsonData = {};
        await this.initData();
    }
    async initData(){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 50000; 
        let res = await tools.getBipInsAidInfo("PURPOSES", 210, qe);
        if(res.data.id ==0 ){
            this.amb_purposes_val = res.data.data.data.values;
            this.amb_purposes_val.forEach((item:any) => {
                this.jsonData[item.id] = item;
                if(item.is_main == 1){
                    this.amb_purposes_id = item.id;
                }
            });
            if(this.amb_purposes_id == "" && this.amb_purposes_val.length>0){
                this.amb_purposes_id = this.amb_purposes_val[0].id;
            }
        }else{
            this.$notify.error("获取核算目的出错！");
        }
    }
    @Watch("amb_purposes_id")
    purposesChange(){//核算目的发生变化
        let data = null;
        if(this.amb_purposes_id){
            data = this.jsonData[this.amb_purposes_id]
        }
        this.$emit("dataChange",data);
    }
}
</script>
<style scoped lang="scss" > 
</style>