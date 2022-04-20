<template>
  <div id="coverCot" :style="'width: 100%; height:'+tableHeight+'px ;overflow: hidden'">
        <section class="section-cot" style="width: 100%; height: 100%;">

            <div id="container" @click.stop="hideFn">
                <MenuBar v-if="showContextMenu" ref="menuBar" @callBack="contextMenuFn"/>
                <header>
                    <el-tooltip class="item" effect="dark" content="项目" placement="bottom">
                        <i class="el-icon-menu" @click="showDrawerFn()"/>
                    </el-tooltip>
                    <!-- <el-tooltip class="item" effect="dark" content="长按shift多选" placement="bottom">
                        <i class="el-icon-crop"/>
                    </el-tooltip> -->
                    <el-tooltip class="item" effect="dark" content="放大" placement="bottom">
                        <i class="el-icon-zoom-in" @click="zoomFn(0.2)"/>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="缩小" placement="bottom">
                        <i class="el-icon-zoom-out" @click="zoomFn(-0.2)"/>
                    </el-tooltip>
                    <!-- <el-tooltip class="item" effect="dark" content="适应屏幕" placement="bottom">
                        <i class="el-icon-full-screen" @click="centerFn"/>
                    </el-tooltip> -->
                    <el-tooltip class="item" effect="dark" content="执行" placement="bottom">
                        <i class="el-icon-video-play" @click="startFn()"/>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="保存" placement="bottom">
                        <i class="el-icon-upload" @click="saveFn()"/>
                    </el-tooltip>
                   <!--  <el-tooltip class="item" effect="dark" content="加载保存页面" placement="bottom">
                        <i class="el-icon-link" @click="loadFn()"/>
                    </el-tooltip> -->
                   <!--  <el-tooltip class="item" effect="dark" content="是否禁用" placement="bottom">
                        <i :class="{'el-icon-lock':isLock, 'el-icon-unlock':!isLock}" @click="lockFn()"/>
                    </el-tooltip> -->
                </header>
                <div id="draw-cot"/>
                <Drawer ref="drawer" @addNode="addNode"/>
            </div>
            <div class="config">
            <!-- <config-panel v-if="isReady"/> -->
                  <label class="adad">属性编辑</label>

                  <div v-for="(item,index) in nodeData" :key="index">
                    <el-input placeholder="请输入内容" v-model="item.value">
                      <template slot="prepend">{{item.label}}</template>
                    </el-input>
                  </div>
                        
           </div>
           <DialogMysql ref="dialogMysql"></DialogMysql>
        </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Graph, Node, Path, Cell,Shape, Model  } from "@antv/x6";
import "@antv/x6-vue-shape";

import database from '@/components/x6/nodeTheme/database.vue'
import condition from '@/components/x6/nodeTheme/condition.vue'
import onlyout from '@/components/x6/nodeTheme/onlyOut.vue'
import onlyin from '@/components/x6/nodeTheme/onlyIn.vue'
import MenuBar from "@/components/x6/menuBar";
import Drawer from '@/components/x6/drawer'
import DialogMysql from '@/components/x6/dialog/mysql.vue'

import DataJson from './data'
@Component({
  components: { MenuBar,Drawer,DialogMysql },
})
export default class x6_test extends Vue {
  @State('bipComHeight', { namespace: 'login' }) height!: number;
  graph:any =null; //画布
  showContextMenu:boolean=false;
  isReady:boolean=true;
  nodeData:any={}; //节点属性内容
  timer:any= '';
  isLock:boolean= false;
  tableHeight:number =500;
  created() {
    this.tableHeight =  this.height - 10
    console.log();
    
  }
  mounted() {
     this.initGraph()

     this.startFn(DataJson)
 
  }


  //创建画布
  initGraph(){
   // 注册节点
        Graph.registerNode(
        'dag-condition',
        {
          inherit: 'vue-shape',
          width: 180,
          height: 36,
          component: {
            template: `<condition />`,
            components: {
              condition
            }
          },
          ports: {
            groups: {
              top: {
                position: 'top',
                attrs:
                {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke:
                    '#C2C8D5',
                    strokeWidth: 1,
                    fill: '#fff'
                  }
                }
              },
              bottom: {
                position: 'bottom',
                attrs: {
                  circle: {
                    r: 4,
                    magnet:
                    true,
                    stroke: '#C2C8D5',
                    strokeWidth: 1,
                    fill: '#fff'
                  }
                }
              }
            }
          }
        },
        true
        )

        Graph.registerNode(
        'dag-output',
        {
          inherit: 'vue-shape',
          width: 180,
          height: 36,
          component: {
            template: `<onlyout />`,
            components: {
              onlyout
            }
          },
          ports: {
            groups: {
              top: {
                position: 'top',
                attrs:
                {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke:
                    '#C2C8D5',
                    strokeWidth: 1,
                    fill: '#fff'
                  }
                }
              },
              bottom: {
                position: 'bottom',
                attrs: {
                  circle: {
                    r: 4,
                    magnet:
                    true,
                    stroke: '#C2C8D5',
                    strokeWidth: 1,
                    fill: '#fff'
                  }
                }
              }
            }
          }
        },
        true
        )


        Graph.registerNode(
        'dag-onlyIn',
        {
          inherit: 'vue-shape',
          width: 180,
          height: 36,
          component: {
            template: `<onlyin />`,
            components: {
              onlyin
            }
          },
          ports: {
            groups: {
              top: {
                position: 'top',
                attrs:
                {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke:
                    '#C2C8D5',
                    strokeWidth: 1,
                    fill: '#fff'
                  }
                }
              },
              bottom: {
                position: 'bottom',
                attrs: {
                  circle: {
                    r: 4,
                    magnet:
                    true,
                    stroke: '#C2C8D5',
                    strokeWidth: 1,
                    fill: '#fff'
                  }
                }
              }
            }
          }
        },
        true
        )




        Graph.registerNode(
        'dag-node',
        {
          inherit: 'vue-shape',
          width: 180,
          height: 36,
          component: {
            template: `<database />`,
            components: {
              database
            }
          },
          ports: {
            groups: {
              top: {
                position: 'top',
                attrs:
                {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke:
                    '#C2C8D5',
                    strokeWidth: 1,
                    fill: '#fff'
                  }
                }
              },
              bottom: {
                position: 'bottom',
                attrs: {
                  circle: {
                    r: 4,
                    magnet:
                    true,
                    stroke: '#C2C8D5',
                    strokeWidth: 1,
                    fill: '#fff'
                  }
                }
              }
            }
          }
        },
        true
        )
        //自定义边框
        Graph.registerEdge(
        'dag-edge',
        {
          inherit: 'edge',
          attrs: {
            line: {
              stroke: '#C2C8D5',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8
              }
            }
          }
        },
        true
        )
        //自义定连接线
        Graph.registerConnector(
        'algo-connector',
        (s, e) => {
          const offset = 4
          const deltaY = Math.abs(e.y - s.y)
          const control = Math.floor((deltaY / 3) * 2)

          const v1 = {x: s.x, y: s.y + offset + control}
          const v2 = {x: e.x, y: e.y - offset - control}

          return Path.normalize(
          `M ${s.x} ${s.y}
           L ${s.x} ${s.y + offset}
           C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
           L ${e.x} ${e.y}
          `
          )
        },
        true
        )


    const graph:any = new Graph({
       grid: {
            size: 10,
            visible: true,
            type: 'dot', // 'dot' | 'fixedDot' | 'mesh'
            args: {
              color: '#a05410', // 网格线/点颜色
              thickness: 1 // 网格线宽度/网格点大小
            }
          },
          background: {
            color: '#fffbe6' // 设置画布背景颜色
          },
          container: document.getElementById('draw-cot') as HTMLElement,
          panning: {
            enabled: true,
            eventTypes: ['leftMouseDown', 'mouseWheel']
          },
          mousewheel: {
            enabled: true,
            modifiers: 'ctrl',
            factor: 1.1,
            maxScale: 1.5,
            minScale: 0.5
          },
          highlighting: {
            magnetAdsorbed: {
              name: 'stroke',
              args: {
                attrs: {
                  fill: '#fff',
                  stroke: '#31d0c6',
                  strokeWidth: 4
                }
              }
            }
          },
          connecting: {
            snap: true,
            allowBlank: false,
            allowLoop: false,
            highlight: true,
            connector: 'algo-connector',
            connectionPoint: 'anchor',
            anchor: 'center',
            validateMagnet({magnet}) {
              // return magnet.getAttribute('port-group') !== 'top'

              // 限制连线配置
              return true
            },
            createEdge() {
              return graph.createEdge({
                shape: 'dag-edge',
                attrs: {
                  line: {
                    strokeDasharray: '5 5',
                    targetMarker: {
                      name: 'block',
                      width: 12,
                      height: 8
                    }
                  }
                },
                zIndex: -1
              })
            }
          },
          selecting: {
            enabled: true,
            multiple: true,
            rubberEdge: true,
            rubberNode: true,
            modifiers: 'shift',
            rubberband: true
          },
          
          keyboard: true,
          clipboard: true,
          history: true
        });

        this.graph = graph;

        //节点选中事件
        graph.on('node:selected', (args: { 
          cell: Cell
          node: Node 
          options: Model.SetOptions 
        }) => { 
          // code here
          this.nodeData=args.node.data.data
          console.log(args);
          
        })

        graph.on('edge:contextmenu', (args:{e:any, x:any, y:any, edge:any, view:any}) => {
          this.showContextMenu = true
          this.$nextTick(() => {
            let ref_menuBar:any = this.$refs.menuBar;
            ref_menuBar.initFn(args.e.offsetX, args.e.offsetY, {type: 'edge', item: args.edge})
          })
        })

        graph.on('node:contextmenu', (args:{e:any, x:any, y:any, node:any, view:any}) => {
          this.showContextMenu = true
          this.$nextTick(() => {
            // this.$refs.menuBar.setItem({ type: 'node', item: node })
            const p = graph.localToPage(args.x,args.y)
            console.log("p.y",p.y);
            
            let ref_menuBar:any = this.$refs.menuBar;
            ref_menuBar.initFn(p.x, parseInt(p.y)-20, {type: 'node', item: args.node})

            
          })
        })

        graph.on('edge:connected', (args:{edge:any}) => {
          const source = graph.getCellById(args.edge.source.cell)
          const target = graph.getCellById(args.edge.target.cell)

          // 只允许输入
          if (target.data.type == 'output') {
            return graph.removeEdge(args.edge.id)
          }

          // 只允许输出
          if (source.data.type == 'onlyIn') {
            return graph.removeEdge(args.edge.id)
          }


          // 如果线源头的一端链接桩只允许输入
           if(/in/.test(args.edge.source.port)){
             return graph.removeEdge(args.edge.id)
           }

          // 目标一端链接桩只允许输出
          if(/out/.test(args.edge.target.port)){
            return graph.removeEdge(args.edge.id)
          }


          if (source.data.type == 'condition') {
            console.log(source)
            console.log(target)
            console.log(args.edge)
            if (target.data.t === args.edge.id || target.data.f === args.edge.id) {
              return graph.removeEdge(args.edge.id)
            }
            /* this.$refs.dialogCondition.visible = true
            this.$refs.dialogCondition.init(source.data, args.edge) */
          }

          args.edge.attr({
            line: {
              strokeDasharray: ''
            }
          })
        })

        graph.on('node:change:data', (args:{node:any}) => {
          const edges = graph.getIncomingEdges(args.node)
          const {status} = args.node.getData()
          if(edges){
            edges.forEach((edge:any) => {
            if (status === 'running') {
              edge.attr('line/strokeDasharray', 5)
              edge.attr('line/style/animation', 'running-line 30s infinite linear')
            } else {
              edge.attr('line/strokeDasharray', '')
              edge.attr('line/style/animation', '')
            }
          })
          }
          
        })
        

        

        console.log(this.graph);
        
  }

  //显示节点状态
  async showNodeStatus(statusList:any) {
        const status = statusList.shift()
        if(status){
            status.forEach((item:any) => {
                      const {id, status} = item
                      const node = this.graph.getCellById(id)
                      const data = node.getData()
                      node.setData({
                        ...data,
                        status: status
                      })
                    })
        }
        this.timer = setTimeout(() => {
          this.showNodeStatus(statusList)
        }, 1500)
  }
// 初始化节点/边
      init(data = []) {
        const cells:any = []
        data.forEach((item:any) => {
          if (item.shape === 'dag-edge') {
            cells.push(this.graph.createEdge(item))
          } else {
            delete item.component
            cells.push(this.graph.createNode(item))
          }
        })
        this.graph.resetCells(cells)
      }

  //保存
  saveFn(){
    //localStorage.setItem('x6Json', JSON.stringify(this.graph.toJSON({diff: true})))

    console.log(JSON.stringify(this.graph.toJSON({diff: true})));
     
  }
  //执行
  startFn(item:any) {

    console.log(item);
    
       /*  this.timer && clearTimeout(this.timer)
        this.init(item || DataJson)
       //this.showNodeStatus(Object.assign([], nodeStatusList))
        this.graph.centerContent() */
  }
  hideFn() {
        this.showContextMenu = false
  }
  getNodeById(id:any) {
    return this.graph.getCellById(id)
  }
  //组件节点编辑
  contextMenuFn(type:any, node:any) {
        switch (type) {
          case 'remove':
            if (node.type == 'edge') {
              this.graph.removeEdge(node.item.id)
            } else if (node.type == 'node') {
              this.graph.removeNode(node.item.id)
            }
            this.nodeData = null;
            break
          case "source":
            let refDialog:any = this.$refs.dialogMysql;
            refDialog.visible = true
            refDialog.init(node)
            break;
        }

        this.showContextMenu = false
  }
  //缩小&扩大画布大小
  zoomFn(num:any) {
      this.graph.zoom(num)
  }
  //显示隐藏左侧组件区域
  showDrawerFn() {
      const drawerShow:any = this.$refs.drawer;
      drawerShow.visible = !drawerShow.visible
  }

  //添加组件节点
  addNode(option:any) {
      const p = this.graph.pageToLocal(option.x, option.y)
      this.graph.addNode(Object.assign({}, option, p))
  }

  
   @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -10
    }
}
</script>



<style type="scss" scoped>
 body {
  box-sizing: border-box;
  margin: 0;
} 
header {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 50px;
}

header i {
  margin: 8px;
  font-size: 30px;
}
 

.my-selecting {
  border: 1px solid red;
  display: block;
  z-index: 0;
}

@keyframes running-line {
  to {
    stroke-dashoffset: -1000;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.config {
  box-sizing: border-box;
  width: 400px;
  height: 100%;
  padding: 10px 10px;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}
.x6-node-selected .node {
  border-color: #1890ff;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #d4e8fe;
}

.x6-node-selected .node.success {
  border-color: #52c41a;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #ccecc0;
}

.x6-node-selected .node.failed {
  border-color: #ff4d4f;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #fedcdc;
}

.x6-edge:hover path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1px;
}

.x6-edge-selected path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1.5px !important;
}

.section-cot {
  display: flex;
}

.section-cot #container {
  position: relative;
  flex: 1;
}

.section-cot #container #draw-cot {
  width: 100%;
  height: 100%;
}

::-webkit-scrollbar {
  width: 0;
}
</style>