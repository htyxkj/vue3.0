// <template>
//     <div id="tMapDiv" style="width:100%;height:100%"></div>
// </template>
// <script lang="ts">
// import { Component, Vue, Provide, Watch } from "vue-property-decorator";
// import { State, Action, Getter, Mutation } from "vuex-class";
// @Component({
//   components: {

//   }
// }) 
// export default class MyTianMap extends Vue {
//     @Provide() tMap:any=null;
//     @Provide() tZoom:number=12;
//     created(){

//     }
//     mounted(){
//         this.createdMap();
//     }
//     createdMap(){
//         console.log("初始化天地图！")
//         this.tMap = new T.Map('tMapDiv');
//         this.tMap.centerAndZoom(new T.LngLat(116.40769, 39.89945), this.tZoom);
//     }
//     mapChnage(){

//     }  
// }
// </script>
// <style scoped lang="scss" >
// .myTab{
//     height: 600px;
// }
// </style>