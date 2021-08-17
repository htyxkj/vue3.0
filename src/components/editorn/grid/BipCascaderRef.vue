<template>
    <div class="bip-show" :disabled="disabled">
       {{showValues}}
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { Cell } from '../../../classes/pub/coob/Cell';
@Component({})
export default class BipCascaderRef extends Vue{
    @Prop() cell!:Cell
    @Prop() model!:string
    options:any = []
    disabled:boolean = false
    multiple:boolean = false
    bcode:boolean = false
    showValues:any="";
    model1:any = [];
    props:any={
        multiple : false
    }
    mounted(){
        this.disabled = (this.cell.attr & 0x40) > 0;
        this.multiple = (this.cell.attr & 0x200000) > 0;
        this.props.multiple = this.multiple;
        this.bcode = (this.cell.attr & 0x40000) > 0;
        this.initOPtions();
    }
    async initOPtions(){
        this.options = [];
        await this.$axios.get('./static/cascader/'+this.cell.editName+'.json').then((res:any) => { 
            this.options = res.data;
        }).catch((err:any) => {
            console.log(err)
        })
        this.initModel();
    }
    initModel(){
        if(this.model){
            let values = [this.model];
            if(this.multiple){
                values = this.model.split(";")
            }
            for(var j=0;j<values.length;j++){
                for(var i=0;i<this.options.length;i++){
                    let md:any = this.searchTree(this.options[i],values[j]);
                    if(md && md.length>1){
                        this.showValues += md.join('-')+"/"
                    }
                }
            }
        }else{
            this.model1 = [];
        }
    }
    searchTree(tree:any, id:any) {
        let res = this.findNode(tree, id)
        if (res == undefined) {
            return null;
        }
        res.path.unshift(tree.label)
        return res.path
    }
    // 深度遍历查找目标节点及缓存相关路径
    findNode(tree:any, id:any):any {
        if (tree.value == id) {
            return {
                path: [],
                node: tree
            }
        }
        let res;
        if(tree.children)
        for (let i = 0; i < tree.children.length; i++) {
            res = this.findNode(tree.children[i], id)
            if (res != undefined) {
                res.path.unshift(tree.children[i].label)
                return res
            }
        }
        return undefined
    }
    @Watch("model")
    modelChange(){
        this.initModel();
    }
}
</script>


<style lang="scss">
.bip-show{
    width: 100%;
    padding: 0 0;
}
</style>
