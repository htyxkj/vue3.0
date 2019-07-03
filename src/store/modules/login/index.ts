import { RootState } from '../types'
import { LoginState } from "./types";
import { User } from '@/classes/User';
import { Menu } from '@/classes/Menu';

import { Module } from 'vuex'
import { GetterTree, ActionTree, MutationTree  } from 'vuex'
/**
 * 申明状态state
 */

const _isLogin:boolean = (window.sessionStorage.getItem('isLogin')+'')==='true'
const _u = JSON.parse(window.sessionStorage.getItem('user')+'')
const _m = JSON.parse(window.sessionStorage.getItem('menulist')+'')
const _isOpenMenu = false;
const state:LoginState = {
    isLogin: _isLogin,
    snkey: JSON.parse(window.sessionStorage.getItem('snkey')+''),
    user:_u ===null?new User('','',''):_u,
    menulist: _m === null?[]:_m,
    isOpenMenu:_isOpenMenu,
}

const mutations :MutationTree<LoginState> = {
    isLogin:(state:LoginState,data:boolean) => {
        state.isLogin = data;
        window.sessionStorage.setItem('isLogin',JSON.stringify(data));
    },
    snkey:(state:LoginState,data:string) => {
        state.snkey = data;
        window.sessionStorage.setItem('snkey',JSON.stringify(data));
    },
    user:(state:LoginState,data:User) => {
        state.user = data;
        window.sessionStorage.setItem('user',JSON.stringify(data));
    },
    menulist:(state:LoginState,data:Menu[]) => {
        state.menulist = data;
        window.sessionStorage.setItem('menulist',JSON.stringify(data));
    },
    setIsOpenMenu:(state:LoginState,data:boolean) => {
        state.isOpenMenu = data;
        window.sessionStorage.setItem('isOpenMenu',JSON.stringify(data));
    }
}

const getters: GetterTree<LoginState, RootState> = {
    isLogin(state) : boolean {
        return state.isLogin
    },
    snkey(state) : string {
        return state.snkey
    },

    user(state) : User {
       return state.user
    },
    menulist(state) : Menu[] {
        return state.menulist
    },
    isOpenMenu(state) : boolean {
        return state.isOpenMenu
    },
  }

const namespaced: boolean = true;


export const login: Module<LoginState, RootState> = {
    namespaced,
    state,
    getters,
    // actions,
    mutations
  };

