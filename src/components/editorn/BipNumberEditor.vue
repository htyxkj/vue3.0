<template>
  <el-col :span="span" :xs="24" :sm="24" :md="span">
    <template v-if="!bgrid">
      <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
          <span slot="label" v-if="cell.labelString">
            <template v-if="cell.labelString.length>6">
                <el-tooltip class="item" effect="dark" :content="cell.labelString" placement="top">
                    <span>{{cell.labelString.substring(0,5)}}…</span>
                </el-tooltip>
            </template>
            <template v-else>
                {{cell.labelString}}
            </template>
        </span>
        <el-input size="medium" v-model="model1" :clearable="clearable"
        @focus="focus"
          :style="cell.desc ? 'width: calc(100% - 29px);' : 'width:100%'" :disabled="(cell.attr & 0x40) > 0"
          @change="dataChange" :precision="ccPoint" controls-position="right">
          <el-popover  slot="append" placement="top-end" trigger="click">
            <div class="calculator" @click="stopBubble($event)">
              <Calculator @valueChange="valueChange" :value="model1"></Calculator>
            </div>
            <el-button  slot="reference" icon="iconfont icon-bip-calculator" :disabled="(cell.attr & 0x40) > 0" @click="calculatorClick($event)":id="cell.id"></el-button>
          </el-popover>
        </el-input>
        <template v-if="cell.desc">
          <span
            style="
              position: relative;
              line-height: 32px;
              width: 29px;
              padding: 5px 0px 5px 5px;
            "
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="cell.desc"
              placement="top"
            >
              <i class="iconfont icon-bip-bangzhu" style="font-size: 14px"></i>
            </el-tooltip>
          </span>
        </template>
      </el-form-item>
    </template>
    <template v-else>
      <el-input
        size="medium"
        v-model="model1"
        :clearable="clearable"
        :disabled="(cell.attr & 0x40) > 0"
        @change="dataChange"
        :precision="ccPoint"
        controls-position="right"
        @focus="focus"
      ></el-input>
    </template>
    <div></div>
  </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import { Cell } from "@/classes/pub/coob/Cell";
import { CommICL } from "@/utils/CommICL";
let icl = CommICL;
import Calculator from "@/components/calculator/Calculator.vue";
@Component({
  components: { Calculator },
})
export default class BipNumberEditor extends Vue {
  @Prop() cds!: CDataSet;
  @Prop() cell!: Cell;
  @Prop() model: any;
  @Prop() bgrid!: boolean;
  @Prop() row!: number;
  model1: any = "";
  clearable: boolean = false;
  ccPoint: number = 0;
  span: number = 6;
  showCalculator: boolean = false;
  datachangeBusID: number = 0;
  mounted() {
    if (this.model) {
      this.model1 = parseFloat(this.model + "");
      if (isNaN(this.model1)) this.model1 = "";
    } else {
      this.model1 = null;
    }

    this.ccPoint = this.cell.ccPoint;
    if (!this.bgrid) {
      this.span = Math.round(
        (24 / this.cds.ccells.widthCell) * this.cell.ccHorCell
      );
    } else {
      this.span = 24;
    }
    this.datachangeBusID = this.$bus.$on(
      "CalculatorClick",
      this.busCalculatorClick
    );
  }

  dataChange(value: string | number) {
    if (this.cds.currCanEdit()) {
      if (this.model1 !== this.model) {
        let chkr = true;
        if (this.model1) {
          if((this.model1+"").indexOf("~") ==-1){
            if (!this.isNumber(this.model1)) {
              let errInfo: string = "请输入数字...";
              this.$message({
                type: "warning",
                message: errInfo,
                offset: 200,
              });
              this.model1 = this.model;
              return;
            }
          }
        }
        if (this.cell.chkRule) {
          chkr = false;
          let rr = this.cell.chkRule;
          let rules = rr.split(";");
          for (let k = 0; k < rules.length; k++) {
            if (rr.indexOf("~") > 0) {
              let vr: Array<any> = rr.split("~");
              let value = parseFloat(this.model1);
              if (isNaN(value)) {
                value = 0;
              }
              if (vr[0] != "") {
                let min = parseFloat(vr[0]);
                if (isNaN(min)) {
                  min = 0;
                }
                if (value < min) {
                  chkr = false;
                  this.model1 = this.model;
                  let errInfo: string = "不可以小于最小值【" + min + "】";
                  this.$message({
                    type: "warning",
                    message: errInfo,
                    offset: 200,
                  });
                  return;
                }
              }

              if (vr[1] != "") {
                let max = parseFloat(vr[1]);
                if (isNaN(max)) {
                  max = 0;
                }
                if (value > max) {
                  this.model1 = this.model;
                  let errInfo: string = "不可以超过最大值【" + max + "】";
                  this.$message({
                    type: "warning",
                    message: errInfo,
                    offset: 200,
                  });
                  chkr = false;
                  return;
                }
              }
            } else {
              if ("D" == rr && this.model1) {
                if (!this.isNumber(this.model1)) {
                  let errInfo: string = "请输入数字...";
                  this.$message({
                    type: "warning",
                    message: errInfo,
                    offset: 200,
                  });
                  chkr = false;
                }
              }
            }
          }

          chkr = true;
        }
        if (chkr && this.model1) {
          //保留小数位数
          if(this.cell.ccPoint && this.model1.indexOf("~") ==-1){
            this.model1 = parseFloat(this.model1).toFixed(this.cell.ccPoint);
          }
          this.cds.currRecord.data[this.cell.id] = this.model1;
          this.cds.cellChange(this.cell.id, this.model1);
          if (this.cds.baseI) {
            // console.log('cellDataChange',this.model1)
            this.cds.baseI.cellDataChange(this.cds, this.cell.id, this.model1);
          }
          this.cds.setStateOrAnd(icl.R_EDITED);
          if (this.cds.ds_par) {
            this.cds.ds_par.setStateOrAnd(icl.R_EDITED);
          }
          this.cds.checkGS(this.cell);
          this.cds.currRecord.c_state |= 2;
          if (this.cds.ds_par) {
            this.cds.ds_par.currRecord.c_state |= 2;
          }
        }
      }
    } else {
      this.model1 = parseFloat(this.model);
      if (isNaN(this.model1)) this.model1 = "";
    }
  }
  @Watch("model")
  cdataSetRecordChange() {
    if (this.model !== this.model1) {
      this.model1 = parseFloat(this.model);
      if (isNaN(this.model1)) this.model1 = "";
    }
  }
  valueChange(val: number) {
    this.model1 = val;
    this.dataChange(val);
  }

  beforeDestroy() {
    this.$bus.$off("CalculatorClick", this.datachangeBusID);
  }
  calculatorClick(event: any) {
    this.focus();
    this.$bus.$emit("CalculatorClick", this.cell.id);
    this.showCalculator = !this.showCalculator;
    this.stopBubble(event);
    let _this = this;
    document.onclick = function () {
      _this.showCalculator = false;
      document.onclick = null;
    };
  }
  //阻止冒泡函数
  stopBubble(e: any) {
    if (e && e.stopPropagation) {
      e.stopPropagation(); //w3c
    } else {
      if (window.event) window.event.cancelBubble = true; //IE
    }
  }

  busCalculatorClick(id: string) {
    if (this.cell.id != id) this.showCalculator = false;
  }

  isNumber(value: any): boolean {
    let reg = new RegExp("^-?[0-9]+.?[0-9]*$");
    let rr = reg.test(value);
    return rr;
  }
  focus(){
    this.$emit("focus",{})
  }
}
</script>
<style scoped>
.calculator{
  z-index:2014; 
  background-color: #ececec;
  width: 244px;
}
</style>
