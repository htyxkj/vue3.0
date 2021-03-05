<template>
    <div>
        <div class="progress-wrapper" :style="wrapStyle">
            <div class="progress" @mousedown.stop="mousedownHandler" @mouseover.stop="mouseoverHandler"
                @mousemove.stop="mousemoveHandler" @mouseup.stop="mouseupHandler" @mouseout.stop="mouseoutHandler" :style="pBarStyle">
                <div class="left" :style="leftStyle">
                    <div class="ball" v-if="canDrag == undefined || canDrag==true" :style="ballStyle"></div>
                </div>
            </div>
        </div>
        <div style="width:10%;float: left;">
            {{percent.toFixed(2)}}%
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
@Component({
    components: {}
})
export default class ProgressBar extends Vue {
    @Prop() leftBg!:string;//左侧颜色
    @Prop() bgc!:string;//背景色
    @Prop() ballBgc!:string;//背景色
    @Prop() height!:string;//高度
    @Prop() width!:string;//宽度
    @Prop() percent!:number;//当前点数%
    @Prop() pointNum!:number;//总点数
    @Prop() canDrag!:boolean;
    @Provide() wrapStyle: any = {width: this.width};
    @Provide() pBarStyle: any = {backgroundColor: "#ccc",height:this.height};
    @Provide() leftStyle: any = {width: this.percent + '%',backgroundColor: "greenyellow",height: this.height};
    @Provide() ballStyle: any = {backgroundColor: "red",height: this.height,width: this.height};
    // 标记是否按下鼠标
    @Provide() isMouseDownOnBall:boolean = false;
    // 鼠标进body时是否是mousedown
    @Provide() isMouseDownOnBody:boolean =  false;
    // 鼠标离开进度条时的clientX
    @Provide() outProgressClientX:any =  0;
    // 主要用于防止一个页面内有多个本组件，MouseMove时互相影响而设置的字段
    @Provide() isCurrentProgress:boolean = false;
    
    //鼠标悬浮显示时间
    @Provide() SuspensionTime:any = '';

    mounted(){
        if(this.leftBg){
            this.leftStyle.backgroundColor = this.leftBg;
        }
        if(this.bgc){
            this.pBarStyle.backgroundColor = this.bgc;
        }
        if(this.ballBgc){
            this.ballStyle.backgroundColor = this.ballBgc;
        }
    }

    get progressElement(){
        return this.$el.getElementsByClassName('progress')[0];
    }
        
 
    mousedownHandler(e:any){ 
        if(this.canDrag == false){
            return;
        }
        if(e.which === 1){
            this.isMouseDownOnBall = true;
            this.isCurrentProgress = true;
        }
    }
    mousemoveHandler(e:any){
        if(this.canDrag == false){
            return;
        }
        let el:any = this.$el;
        //拖拽
        if(this.isMouseDownOnBall && this.isCurrentProgress){
            let decimal = (e.clientX - el.offsetLeft-15) / this.progressElement.clientWidth; 
            let percent = decimal * 100; 
            this.leftStyle.width = percent + '%';
            this.$emit('pbar-drag', percent);
        }
        //悬停
        if(this.isMouseDownOnBall == false){
            let decimal = (e.clientX - el.offsetLeft-15) / this.progressElement.clientWidth; 
            let percent = decimal * 100; 
            let time = this.pointNum*percent/100
            var t = new Date('2018-01-01 00:00:00');
            var t_s = t.getTime();//转化为时间戳毫秒数
            t.setTime(t_s+(time*1000)); 
            this.SuspensionTime=this.formatDate(t,'hh:mm:ss'); 
        }
    }
    mouseupHandler(e:any){ 
        if(this.canDrag == false){
            return;
        }
        let el:any = this.$el;
        if(this.isMouseDownOnBall && this.isCurrentProgress){
            let decimal = (e.clientX - el.offsetLeft-15) / this.progressElement.clientWidth;
            let percent = decimal * 100;
            this.leftStyle.width = percent + '%';
            this.$emit('pbar-seek', percent);
            this.isMouseDownOnBall = false;
            this.isCurrentProgress = false;
        }
    }
    mouseoverHandler(e:any){ 
        if(this.canDrag == false){
            return;
        }
        // 没有按左键进入进度条
        if(e.which === 0){
            this.isMouseDownOnBall = false;
        }
    }
    mouseoutHandler(e:any){ 
        if(this.canDrag == false){
            return;
        }
        if(e.which === 1 && this.isCurrentProgress){
            this.outProgressClientX = e.clientX;
            this.isMouseDownOnBody = true;
            this.bodyEventHandler();
        }
    }
    // body元素的事件监听器
    bodyEventHandler(){ 
        let body = document.getElementsByTagName('body')[0];
        body.addEventListener('mousemove', this.bodyMousemoveHandler);
        body.addEventListener('mouseup', (e) => {
            this.isMouseDownOnBall = false;
            this.isMouseDownOnBody = false;
            this.outProgressClientX = 0;
            this.isCurrentProgress = false;
            body.removeEventListener('mousemove', this.bodyMousemoveHandler);
        })
    }
    // body元素的mousemove事件监听器
    bodyMousemoveHandler(e:any){ 
        let el:any = this.$el;
        e.preventDefault();
        if(e.which === 1 && this.isMouseDownOnBody === true){
            let offsetX = e.clientX - this.outProgressClientX;
            // 右移了
            if(offsetX > 0){
                
                // 在进度条右边界内
                if(e.clientX < this.progressElement.clientWidth + el.offsetLeft-15){
                    let decimal = (e.clientX - el.offsetLeft-15) / this.progressElement.clientWidth;
                    let percent = decimal * 100;
                    this.leftStyle.width = percent + '%';
                    this.$emit('pbar-drag', percent)
                    // 超出右边界
                }else{
                    this.leftStyle.width = '100%';
                    this.$emit('pbar-drag', 100);
                }
                // 左移了
            }else if(offsetX < 0){
                // 在进度条左边界内
                if(e.clientX > el.offsetLeft-15){
                    let decimal = (e.clientX - el.offsetLeft-15) / this.progressElement.clientWidth;
                    let percent = decimal * 100;
                    this.leftStyle.width = percent + '%';
                    this.$emit('pbar-drag', percent)
                    // 超出左边界
                }else{
                    this.leftStyle.width = '0%';
                    this.$emit('pbar-drag', 0);
                }
            }
        }
    }
        //日期格式化
        formatDate(date:any,fmt:any){
            if(/(y+)/.test(fmt)){
                fmt = fmt.replace(RegExp.$1, (date.getFullYear()+'').substr(4-RegExp.$1.length));
            }
            let o:any = {
                'M+': date.getMonth()+1,
                'd+': date.getDate(),
                'h+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds()
            }
            for(let k in o){    
                let str = o[k]+'';
                if(new RegExp(`(${k})`).test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1)?str:this.padLeftZero(str));
                }
            }
            return fmt;
        }
        padLeftZero(str:any){
            return ('00'+str).substr(str.length);
        }
        @Watch("percent")
        _percent(cur:any, old:any){ 
            this.leftStyle.width = cur + '%';
        }
    }
</script>

<style scoped>
    /* .progress-wrapper{
         width:100%; 
    } */
    .progress{
        width:100%;
        height:20px;
        float: left;
        overflow: hidden;
        cursor: pointer;
        margin: 0px;
        padding: 0px;
    }
    .left{
        height:100%;
        width: 0%;
        background-color: greenyellow;
        position: relative;
    }
    .ball{
        height:100%;
        width:6px;
        -webkit-border-radius:10px;
        -moz-border-radius:10px;
        border-radius:10px;
        background-color: red;
        position: absolute;
        right: -4px;
    }
</style>
