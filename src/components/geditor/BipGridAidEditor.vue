<template>
    <div>
        <el-input v-model="model1" class="bip" size="small" :clearable="clearable" :disabled="disabled" @change="dataChange">
            <i slot="suffix" class="bip el-input__icon el-icon-search" @click="iconClick()" :disabled="disabled>0" ></i>
        </el-input>
        <template v-if="dia">
            <bip-assist-editor :aId="cell.editName" :multiple="multiple" ref="ak" @select="selectCallBack"></bip-assist-editor>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipAssistEditor from '../editor/BipAssistEditor.vue'
import AIdAssist from '@/classes/AIdAssist';
import { BIPUtil } from '@/utils/Request';
import { BIPUtils } from '@/utils/BaseUtil';
let tools = BIPUtil.ServApi
import {CommICL} from '@/utils/CommICL'
const icl = CommICL
import { State, Action, Getter, Mutation } from "vuex-class";
import { AssistState } from "@/store/modules/assist/types";

@Component({components:{BipAssistEditor}})
export default class BipGridAidEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell?:Cell
    @Prop() index?:number
    @Prop() model?:string
    @Provide() model1:string=''
    @Provide() dia:boolean = false
    @Provide() isopen:boolean = false
    @Provide() multiple:boolean = false
    @Provide() disabled:boolean = false
    @Provide() mulcols:boolean = false
    @Provide() clearable:boolean = false
    @Provide() aidInfo:AIdAssist = new AIdAssist("")//辅助对象
    @Provide() othCols:Array<string> = []
    @Provide() othColsIndex:Array<number> = []

    @Provide() assistId: string = ""; //辅助ID
    @Getter("AID_INFOS", { namespace: "assit" }) aidMap: any;
    @Getter("KEY_MAPS", { namespace: "assit" }) keyMaps: any;
    @Mutation("setAidInfo", { namespace: "assit" }) setAidInfo: any;
    @Action("fetchAssist", { namespace: "assit" }) fetchAssist: any;
    mounted(){
        let _i = this.index||0
        if(this.cds&&this.cell){
            this.assistId = this.cell.editName;
            // let record:any = this.cds.cdata._data[_i];
            this.model1 = this.model?this.model:''
            this.disabled = (this.cell.attr&0x40)>0
            this.multiple = (this.cell.attr&0x200000)>0
            this.mulcols = (this.cell.attr&0x100000)>0
            if(this.mulcols){
                this.initMulColInfo()
            }
            this.initAssist()         
        }
    }

    // lostFocus(){
    //     console.log('blue')
    //     console.log(this.dia,this.isopen)
    //     if(!this.dia&&this.isopen){
    //         this.$emit('finished') 
    //     }
    // }

    // iconFocused(){
    //     this.isopen = true;
    //     this.dia = true;
    // }

//#region 初始化辅助和参照
    /**
     * 初始化辅助
     */
    async initAssist(){
        if(this.cell){
            let aidii = this.getAidInfos(this.assistId);
            if(aidii){
                this.aidInfo = aidii
                this.aidInfo.initOK = true
            }else{
                let mp: Map<string, boolean> = this.keyMaps;
                let bexit = mp.get(this.assistId);
                if(!bexit){
                    this.fetchAssist({ id: this.assistId, value: this.model1 })
                        .then((res: any) => {
                            if (res && res.data.id === 0) {
                                this.aidInfo = this.aidMap.get(this.assistId);
                                this.aidInfo.initOK = true
                            } else {
                                this.$notify.error(res.message);
                            }
                        })
                        .catch((err: any) => {
                            // console.log(err)
                            this.$notify.error(`获取辅助失败:【${this.assistId}】` + err);
                        });
                }
            }
        }
    }

    /**初始化多列参照 */
    initMulColInfo(){
        let script = this.cell?this.cell.script:''
        if(script){
            let vals = script.split('&')
            if(vals.length<2){
                this.$notify.error('多列定义错误'+script);
            }else{
                let flds = vals[0].split(',')
                let flds_index:Array<number> = vals[1].split(',').map((value)=>{
                    return parseInt(value)
                })
                if(flds.length!=flds_index.length){
                    this.$notify.error('多列参照定义的字段和下标的个数不对'+script);
                }else{
                    this.othCols = flds
                    this.othColsIndex = flds_index
                }
            }
        }
    }

    getAidInfos(key: string) {
        let res = this.aidMap.get(key);
        // console.log(res, "321321321");
        if (!res) {
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            this.setAidInfo({ key: key, value: res });
        }
        return res;
    }
//#endregion
    selectCallBack(value:any){
        this.isopen = false;
        this.dia = false;
        if(value==null){
            this.finished();
            return 
        }
        if(this.cds&&this.cell){
            let _i = this.index?this.index:0
            let record:any = this.cds.cdata._data[_i]
            let cel = this.cell;
            let moo = ''
            if(this.multiple){
                let vvs:Array<any> = value;
                vvs.forEach(item=>{
                    moo+=value[this.aidInfo.layCells[0].id]+';'
                })
                moo = moo.substring(0,moo.length-1)
            }else{
                moo = value[this.aidInfo.layCells[0].id]
            }
            this.model1 = moo
            record[cel.id] = this.model1
            this.aidInfo.values = value
            if(this.mulcols){
                let item = value
                if(value instanceof Array){
                    item = value[value.length-1]
                }else{
                    item = value
                }
                this.othCols.forEach((fld,index)=>{
                    let idx = this.othColsIndex[index]
                    let layC = this.aidInfo.layCells[idx]
                    if(layC){
                        record[fld] = item[layC.id]
                        let methodName = ''
                        // if(this.cds){
                        methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+fld
                        this.cds.cellChange(fld,item[layC.id])
                        // }    
                        if(methodName){
                            this.$bus.$emit(methodName,{cellId:fld,value:item[layC.id],row:this.index})
                        }
                            
                    }
                        
                })
            }
            record.sys_stated = record.sys_stated|2
            this.finished()
        }
    }

    dataChange(value:any){
        let _i = this.index?this.index:0
        if(this.cds&&this.cell){
            let record:any = this.cds.cdata._data[_i];
            record[this.cell.id] = value
            record.sys_stated = record.sys_stated|2
        }
        this.finished()
    }

    @Watch('model')
    modelChange(){
        this.model1 = this.model?this.model:''
        console.log('model change')
    }

    @Watch("aidMap")
    aidMapChange(){
        if(!this.aidInfo){
            this.aidInfo = this.aidMap.get(this.assistId);
        }else{
            if(!this.aidInfo.initOK){
                this.aidInfo = this.aidMap.get(this.assistId)
                if(this.aidInfo){
                    this.aidInfo.initOK = true
                }
            }
        }
    }

    finished(){
            this.$emit('finished')    
    }

        /**
     * 点击弹出辅助选择框
     *  */
    iconClick(){
        if(!this.disabled){
            this.dia = true;
            setTimeout(()=>{
                let dia:any = this.$refs.ak;
                dia.open()
                this.isopen = true;
            },100)    
        }
    }
}
</script>
