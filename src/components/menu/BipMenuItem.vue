<template>
  <div v-if="item.haveChild">
    <template v-if="item.childMenu.length === 0">
        <el-menu-item :index="item.menuId" :route="'layout?'+item.command">
          <i class="el-icon-menu"></i>
          {{item.menuName}}
        </el-menu-item>
    </template>

    <el-submenu v-else :index="item.menuId">
      <template slot="title" >
        <i class="el-icon-menu"></i>
        {{item.menuName}}
      </template>

      <template v-for="child in item.childMenu">
        <bip-menu-item
          v-if="child.childMenu&&child.childMenu.length>0"
          :item="child"
          :key="child.menuId"/>
        <el-menu-item v-else :key="child.menuId" :index="child.menuId" :route="'layout?'+child.command">
          <i class="el-icon-location"></i>
          {{child.menuName}}
        </el-menu-item>
      </template>
    </el-submenu>
  </div>
  <div v-else>
       <el-menu-item :index="item.menuId" :route="'layout?'+item.command">
          <i class="el-icon-menu"></i>
          {{item.menuName}}
        </el-menu-item>
  </div>
</template>
<script lang="ts">
import { Component, Vue,Provide,Prop} from "vue-property-decorator";
import { Menu } from '@/classes/Menu';
@Component
export default class BipMenuItem extends Vue{
    @Prop() private item!:Menu;

}
</script>


