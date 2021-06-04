<template>
    <div>
        <el-tabs v-model="tabsActiveName">
            <el-tab-pane label="　用户权限　" name="user"  style="height:700px">
                <el-row style="padding-left: 15px;">
                    <el-col :span="8">
                        <vxe-toolbar>
                            <template v-slot:buttons>
                                <vxe-input v-model="user_tj" type="search" placeholder="用户检索"></vxe-input>
                            </template>
                        </vxe-toolbar>
                        <vxe-table
                            border
                            height="470"
                            :data="user_list"
                            resizable
                            size="small"
                            highlight-hover-row
                            show-all-overflow="tooltip"
                            show-header-overflow
                            highlight-current-row
                            class="vxe-table-element checkbox-table"
                            :optimized="true"
                            :sort-config="{trigger: 'cell',remote:true}"
                            show-footer
                            row-id="id"
                            header-cell-class-name="tableHead"
                            style="width:400px"
                            align="center"
                            @cell-click="userClick"
                            >
                            <vxe-table-column type="seq" width="80"></vxe-table-column>
                            <vxe-table-column field="usrcode" title="编码" width="160" type="html"></vxe-table-column>
                            <vxe-table-column field="usrname" title="名称" width="160" type="html"></vxe-table-column>
                        </vxe-table>
                    </el-col>
                    <el-col :span="16">
                        <el-button class="bip-menu-bar bip_btn_primary savebtn" size="small" @click="saveUserAuth">　　保存　　</el-button>
                        <el-transfer class="my_transfer" filterable :props="{ key: 'menuid',label: 'menuname'}" @change="user_auth_menu_change" :titles='["全部菜单","授权菜单"]'
                            v-model="user_auth_menu" :data="menuList">
                        </el-transfer>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane label="　岗位权限　" name="gw">
                <el-row style="padding-left: 15px;">
                    <el-col :span="8">
                        <vxe-toolbar>
                            <template v-slot:buttons>
                                <vxe-input v-model="gw_tj" type="search" placeholder="岗位检索"></vxe-input>
                            </template>
                        </vxe-toolbar>
                        <vxe-table
                            border
                            height="470"
                            :data="glimit"
                            resizable
                            size="small"
                            highlight-hover-row
                            show-all-overflow="tooltip"
                            show-header-overflow
                            highlight-current-row
                            :optimized="true"
                            :sort-config="{trigger: 'cell',remote:true}"
                            show-footer
                            row-id="id"
                            header-cell-class-name="tableHead"
                            style="width:400px"
                            align="center"
                            @cell-click="gwClick"
                            >
                            <vxe-table-column type="seq" width="80"></vxe-table-column>
                            <vxe-table-column field="gwcode" title="编码" width="160" type="html"></vxe-table-column>
                            <vxe-table-column field="gwname" title="名称" width="160" type="html"></vxe-table-column>
                        </vxe-table>
                    </el-col>
                    <el-col :span="16">
                        <el-button class="bip-menu-bar bip_btn_primary savebtn" size="small" @click="saveGwAuth">　　保存　　</el-button>
                        <el-transfer class="my_transfer" filterable :props="{key: 'menuid',label: 'menuname'}" @change="gw_auth_menu_change" :titles='["全部菜单","授权菜单"]' v-model="gw_auth_menu" :data="menuList">
                        </el-transfer>
                    </el-col>
                </el-row>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
import XEUtils from 'xe-utils'
let tools = BIPUtil.ServApi;
@Component({
  components: {

  }
})
export default class menuAuth extends Vue {
    tabsActiveName:any = 'user'
    
    ulimit:any = [];//用户、用户权限 列表
    glimit:any = [];//岗位、岗位权限 列表
    menuList:any = [];//菜单列表

    user_tj:any = "";//表格重新条件
    gw_tj:any = "";//表格查询条件

    user_auth_menu:any =[];//当前用户权限
    gw_auth_menu:any = [];//当前岗位权限


    checkUser:any = null;//选中用户
    checkUserIndex:any=null;//用户选中下标
    checkGw:any = null;//选中岗位
    checkGwIndex:any = null//岗位选中下标

    user_auth:any = {};//用户修改后的权限
    gw_auth:any = {};//岗位修改后的权限

    async created() {
        this.initAuth();
    }
    async initAuth(){
        let vv = await tools.getMenuAuth();
        if(vv.data.id == 0){
            this.ulimit = vv.data.data.ulimit;
            this.glimit = vv.data.data.glimit;
            this.menuList = vv.data.data.menuList;
        }
    }
    //用户点击
    userClick(data:any){
        this.checkUserIndex = data.rowIndex;
        this.checkUser = data.row.usrcode;
        this.user_auth_menu = data.row.auth;
    }
    //岗位点击
    gwClick(data:any){
        this.checkGwIndex = data.rowIndex;
        this.checkGw = data.row.gwcode;
        this.gw_auth_menu = data.row.auth; 
    }
    //当前用户权限发生变化
    user_auth_menu_change(){
        this.ulimit[this.checkUserIndex].auth = this.user_auth_menu;
        this.user_auth[this.checkUser] = this.user_auth_menu;
    }
    //当前岗位权限发生变化
    gw_auth_menu_change(){
        this.glimit[this.checkGwIndex].auth = this.gw_auth_menu;
        this.gw_auth[this.checkGw] = this.gw_auth_menu;
    }
    //保存用户权限
    async saveUserAuth(){
        let vv = await tools.setMenuAuth(0,JSON.stringify(this.user_auth));
    }
    //保存岗位权限
    async saveGwAuth(){
        let vv = await tools.setMenuAuth(1,JSON.stringify(this.gw_auth));
    }

    get user_list () {
        const filterName = XEUtils.toString(this.user_tj).trim().toLowerCase()
        if (filterName) {
            const filterRE = new RegExp(filterName, 'gi')
            const searchProps = ['usrcode', 'usrname']
            const rest = this.ulimit.filter((item:any) => searchProps.some(key => XEUtils.toString(item[key]).toLowerCase().indexOf(filterName) > -1))
            return rest.map((row:any) => {
                const item:any = Object.assign({}, row)
                searchProps.forEach(key => {
                item[key] = XEUtils.toString(item[key]).replace(filterRE, (match:any) => `<span class="keyword-lighten">${match}</span>`)
                })
                return item
            })
        }
        return this.ulimit
    }
    get gw_list () {
        const filterName = XEUtils.toString(this.gw_tj).trim().toLowerCase()
        if (filterName) {
            const filterRE = new RegExp(filterName, 'gi')
            const searchProps = ['gwcode', 'gwname']
            const rest = this.glimit.filter((item:any) => searchProps.some(key => XEUtils.toString(item[key]).toLowerCase().indexOf(filterName) > -1))
            return rest.map((row:any) => {
                const item:any = Object.assign({}, row)
                searchProps.forEach(key => {
                item[key] = XEUtils.toString(item[key]).replace(filterRE, (match:any) => `<span class="keyword-lighten">${match}</span>`)
                })
                return item
            })
        }
        return this.glimit
    }
}
</script>
<style  lang="scss" scoped>
.savebtn{
    margin: 10px 0px;
}
</style>
<style lang="scss">
.my_transfer{
    .el-transfer-panel{
        width: 300px;
    }
    .el-transfer-panel__body{
        height: 420px;
        .el-transfer-panel__list.is-filterable{
            height: 370px;
        }
    }
}
.keyword-lighten {
    color: #000;
    background-color: #FFFF00;
}
</style>