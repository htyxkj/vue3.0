<template>
    <span style="text-align: center">{{model1}}</span>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { Progress } from 'element-ui';
@Component({})
export default class BipGridShow extends Vue{
    @Prop() cds?:CDataSet
    @Prop() cell?:Cell
    @Prop() index?:number
    @Prop() model?:string
    @Provide() model1:string = ''
    mounted(){
        this.model1 = this.model ||''
        if(this.model1=="Invalid date"){
            this.model1 = ''
        }
    }

    @Watch('model')
    modelChange(){
        this.model1 = this.model ||''
        if(this.model1=="Invalid date"){
            this.model1 = ''
        }
    }

}
</script>


