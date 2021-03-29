<template>
  <div class="hello" ref="calculator" @keyup="press1($event)">
    <div class="calculator">
      <!-- <button @click="changeModeEvent" class="toggle-button">
        <p v-if="changeMode">Show Advanced Mode &nbsp; &nbsp; &#9864;</p>
        <p v-else>Show Basic Mode &nbsp; &nbsp; &#9862;</p>
      </button> -->
      <div class="results">
        <input class="input" v-model="current" />
      </div>
      <div class="mode" v-if="changeMode">
        <button class="button" @click="press">C</button>
        <button class="button" @click="press">&#60;=</button>
        <button class="button" @click="press">%</button>
        <button class="button" @click="press">/</button>

        <button class=" button1" @click="press">7</button>
        <button class=" button1" @click="press">8</button>
        <button class=" button1" @click="press">9</button>
        <button class="button" @click="press">*</button>

        <button class=" button1" @click="press">4</button>
        <button class=" button1" @click="press($event)">5</button>
        <button class=" button1" @click="press">6</button>
        <button class="button" @click="press">-</button>

       
        <button class=" button1" @click="press">1</button>
        <button class=" button1" @click="press">2</button>
        <button class=" button1" @click="press">3</button>
        <button class="button" @click="press">+</button>

       
        <button class="button" @click="press">±</button>
        <button class=" button1" @click="press">0</button>
        <button class="button" @click="press">.</button>
       

        <button class="button " @click="press">=</button>

        <button class="button buttonTools" @click="ok">确定</button>
      </div>
      <div class="mode" v-else>
        <button class="button" @click="press">sin</button>
        <button class="button" @click="press">cos</button>
        <button class="button" @click="press">tan</button>
        <button class="button" @click="press">x^</button>
        <button class="button" @click="press">&#60;=</button>
        <button class="button" @click="press">C</button>
        <button class="button" @click="press">log</button>
        <button class="button" @click="press">ln</button>
        <button class="button" @click="press">e</button>
        <button class="button" @click="press">∘</button>
        <button class="button" @click="press">rad</button>
        <button class="button" @click="press">√</button>
        <button class="button" @click="press">7</button>
        <button class="button" @click="press">8</button>
        <button class="button" @click="press">9</button>
        <button class="button" @click="press">/</button>
        <button class="button" @click="press">x ²</button>
        <button class="button" @click="press">x !</button>
        <button class="button" @click="press">4</button>
        <button class="button" @click="press">5</button>
        <button class="button" @click="press">6</button>
        <button class="button" @click="press">*</button>
        <button class="button" @click="press">(</button>
        <button class="button" @click="press">)</button>
        <button class="button" @click="press">1</button>
        <button class="button" @click="press">2</button>
        <button class="button" @click="press">3</button>
        <button class="button" @click="press">-</button>

        <button class="button" @click="press">±</button>
        <button class="button" @click="press">0</button>
        <button class="button" @click="press">.</button>
        <button class="button" @click="press">&#x003C0;</button>
        <button class="button" @click="press">+</button>
        <button class="button equal-sign" @click="press">=</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
@Component({})
export default class Calculator extends Vue {
  @Prop() value!: Number;
  current: any = '';
  changeMode: boolean = true;
  press1(event: any) {
    // if(event.keyCode >= 48 && event.keyCode<=57)
    // this.calculation(event.key);
  }
  mounted(){
    if(this.value){
      this.current = this.value;
    }
  }

  press(event: any) {
    var key = event.target.textContent;
    this.calculation(key);
  }

  calculation(key: any) {
    var me = this;
    me.current+=''
    if (
      key != "=" &&
      key != "C" &&
      key != "*" &&
      key != "/" &&
      key != "√" &&
      key != "x ²" &&
      key != "%" &&
      key != "<=" &&
      key != "±" &&
      key != "sin" &&
      key != "cos" &&
      key != "tan" &&
      key != "log" &&
      key != "ln" &&
      key != "x^" &&
      key != "x !" &&
      key != "π" &&
      key != "e" &&
      key != "rad" &&
      key != "∘"
    ) {
      me.current += key;
    } else if (key === "=") {
      me.current+='';
      if (me.current && me.current.indexOf("^") > -1) {
        var base = me.current.slice(0, me.current.indexOf("^"));
        var exponent = me.current.slice(me.current.indexOf("^") + 1);
        me.current = eval("Math.pow(" + base + "," + exponent + ")");
      } else {
        if(me.current){
          me.current = eval(me.current);
        }
      }
    } else if (key === "C") {
      me.current = "";
    } else if (key === "*") {
      me.current += "*";
    } else if (key === "/") {
      me.current += "/";
    } else if (key === "+") {
      me.current += "+";
    } else if (key === "-") {
      me.current += "-";
    } else if (key === "±") {
      if (me.current.charAt(0) === "-") {
        me.current = me.current.slice(1);
      } else {
        me.current = "-" + me.current;
      }
    } else if (key === "<=") {
      me.current = me.current.substring(0, me.current.length - 1);
    } else if (key === "%") {
      me.current = me.current / 100;
    } else if (key === "π") {
      me.current = me.current * Math.PI;
    } else if (key === "x ²") {
      me.current = eval(me.current * me.current + "");
    } else if (key === "√") {
      me.current = Math.sqrt(me.current);
    } else if (key === "sin") {
      me.current = Math.sin(me.current);
    } else if (key === "cos") {
      me.current = Math.cos(me.current);
    } else if (key === "tan") {
      me.current = Math.tan(me.current);
    } else if (key === "log") {
      me.current = Math.log10(me.current);
    } else if (key === "ln") {
      me.current = Math.log(me.current);
    } else if (key === "x^") {
      me.current += "^";
    } else if (key === "x !") {
      var number = 1;
      if (me.current === 0) {
        me.current = "1";
      } else if (me.current < 0) {
        me.current = NaN;
      } else {
        var _number = 1;
        for (var i = me.current; i > 0; i--) {
          _number *= i;
        }
        me.current = _number;
      }
    } else if (key === "e") {
      me.current = Math.exp(me.current);
    } else if (key === "rad") {
      me.current = me.current * (Math.PI / 180);
    } else if (key === "∘") {
      me.current = me.current * (180 / Math.PI);
    }
  }
  ok(){
    let curr = this.current;
    curr = curr+'';
    if (curr && curr.indexOf("^") > -1) {
      var base = curr.slice(0, curr.indexOf("^"));
      var exponent = curr.slice(curr.indexOf("^") + 1);
      curr = eval("Math.pow(" + base + "," + exponent + ")");
    } else {
      if(curr){
        curr = eval(curr);
      }
    }
    this.current = curr;
    this.$emit("valueChange",curr)
  }
  close(){
    this.$emit("valueChange",this.value)
  }
  changeModeEvent() {
    var me = this;
    me.changeMode = !me.changeMode;
  }
}
</script>
<style lang="scss" scoped>
.hello {
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: black;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.calculator {
  width: 250px;
  // padding: 20px;
  border-radius: 5px;
  margin: 10px auto;
  font-size: 16px;
  background-color: #ECECEC;
  
}

.input {
  width: 220px;
  height: 38px;
  border-radius: 0px;
  margin: 0 0px 5px 0px;
  font-size: 26px;
}

.button {
  margin: 3px;
  width: 50px;
  height: 35px;
  border-radius: 4px;
  color: black;
  font-weight: 600;
  background-color: #f0f0f0;
  cursor: pointer;
  outline: none;
  margin: 1px;
  font-size: 16px;
}
.button:hover {
    background-color: #84BEEC;
}
.buttonTools{
  width: 228px;
}
.button1 {
    background-color: #ffffff;
    margin: 3px;
    width: 50px;
    height: 35px;
    border-radius: 4px;
    color: black;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    margin: 1px;
    font-size: 16px;
}
.button1:hover {
     background-color: #E4E4E4;
}

.mode {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  
}

.equal-sign {
  background-color: green;
  width: 133px;
}

.toggle-button {
  border: none;
  background-color: #333333;
  cursor: pointer;
  outline: none;
  font-size: 1rem;
  color: #fff;
  text-shadow: -1px -1px 0px rgba(0, 0, 0, 0.35);
}

p {
  margin-top: 0px;
}

button::-moz-focus-inner {
  border-color: transparent;
}
</style>