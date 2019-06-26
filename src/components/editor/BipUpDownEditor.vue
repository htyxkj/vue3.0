<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
            <el-input v-model="model1" size="small" :clearable="clearable" :disabled="disabled" :readonly="true">
                <i slot="suffix" class="el-input__icon el-icon-document"  :disabled="disabled" @click="iconClick()"></i>
            </el-input>
        </el-form-item>
        <template v-if="dia">
            <bip-file-editor ref="file" :cds="cds" :cell="cell" :index="index" @select="selectOK"></bip-file-editor>
        </template>
            
    </el-col>
</template>
<script lang="ts">
//辅助query
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipFileEditor from './BipFileEditor.vue'
// import { BIPUtil } from '@/utils/Request';
@Component({
    components:{BipFileEditor}
})
export default class BipUpDownEditor extends Vue{
  @Prop() cds!: CDataSet;
  @Prop() cell!: Cell;
  @Prop() index!: number;
  @Prop() model?: any ;
  @Provide() model1: any = "";
  @Provide() clearable: boolean = false;
  @Provide() disabled: boolean = false;
  @Provide() dia: boolean = false;
  @Provide() fj_root:string = ''
  @Provide() span:number = 6
  
  mounted(){
    //   if(this.cds&&this.cell){
          this.model1 = this.model
          this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
    //   }
  }

  iconClick(){
    if(!this.disabled){
        this.dia = true;
        setTimeout(()=>{
            let file:any = this.$refs.file
            file.open()
        },100)    
    }
  }

  selectOK(bok:boolean){
      this.dia = false
  }

  @Watch('model')
  dataChange(){
      if(this.cds&&this.cell){
          if(this.model != this.model1){
              this.model1 = this.model;
          }
      }
  }

}
</script>