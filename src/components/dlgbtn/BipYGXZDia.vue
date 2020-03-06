<template>
    <el-dialog class="bipinsaid" :visible.sync="visibles" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false">
        <!--弹出框头部-->
        <span slot="title">
            <div class="el-dialog__title" style="padding-bottom:5px">人员选择</div>
        </span>
        <el-transfer 
            v-model="checkUser" :data="userList"
            :titles="['人员', '人员']"
            style="padding-left:100px;"
        ></el-transfer>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="visibles = false">取 消</el-button> 
            <el-button size="small" type="primary" @click="selectOK()">确定</el-button>
        </span>

    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator" 
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BIPUtil } from '@/utils/Request';
let tools = BIPUtil.ServApi
@Component({})
export default class BipYGXZDia extends Vue{
    @Prop() row!:number
    @Prop() value!:string
    @Provide() visibles:boolean = false;
    @Provide() checkUser:any=[];
    @Provide() userList:any=[]; 
    @Provide() btn:any = null;
    @Provide() lbno:any = null;
    @Provide() yymm:any = null;
    @Provide() jsonVal:any={};
    @Provide() env: CCliEnv = new CCliEnv();
    @Provide() refer:any=null;
    mounted(){
        
    }

    updated(){ 
    }
    /**
     * values 员工集合
     * refer 参照     目标字段：来源字段
     * b 按钮
     * lbno 薪资类别
     * yymm 薪资年月
     * env
     */
    open(values:any,refer:any,b:any,lbno:any,yymm:any,env:any){
        this.env = env;
        this.lbno= lbno;
        this.yymm = yymm;
        this.refer= refer;
        b = JSON.parse(b)
        b.dlgCont = b.dlgCont.replace("*200","*201")
        this.btn = b;
        if(values){
            this.userList = [];
            for(var i=0;i<values.length;i++){
                let vl = values[i];
                this.jsonVal[vl.yg_no] = vl;
                let data ={
                    key: vl.yg_no,
                    label: vl.name,
                }
                this.userList.push(data);
            }
            this.visibles = true;
        } 
    } 

    async selectOK(){ 
        let b = JSON.stringify(this.btn);
        let jsonv = {users:this.checkUser,lbno:this.lbno,yymm:this.yymm}
        let v = JSON.stringify(jsonv); 
        await tools.getDlgRunClass(v,b).then(res =>{
            if(res.data.id==0 && this.env.dsm.canEdit){
                let values = res.data.data.values;
                let dsm = this.env.dsm.ds_sub[0];
                dsm.clear();
                this.$bus.$emit('datachange',dsm.ccells.obj_id);
                for(var i=0;i<values.length;i++){
                    dsm.currRecord.c_state |= 2;
                    if(dsm.ds_par){
                        dsm.ds_par.currRecord.c_state |= 2;
                    }
                    dsm.createRecord();
                    let vl = values[i];
                    let userID = vl.userid;
                    let ygdata = this.jsonVal[userID];
                    for(var rkey in this.refer){
                        let to =rkey;
                        let fm = this.refer[rkey];
                        dsm.currRecord.data[to] = ygdata[fm];
                    }
                    for(var vkey in vl){
                        if(vkey !='userid'){
                            dsm.currRecord.data[vkey] = vl[vkey];
                        }
                    }
                }
            }else{ 
                this.$notify.error(res.data.message)
            }
            this.visibles = false;
        })
    }
 
}
</script>
<style lang="scss"> 
</style>