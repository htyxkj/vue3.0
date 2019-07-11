import { RootState } from '../types';
import { AssistState } from './types';
import { Module, GetterTree, MutationTree, ActionTree } from 'vuex';
import AIdAssist from '@/classes/AIdAssist';
import { BIPUtil } from "@/utils/Request";
import { AxiosPromise } from 'axios';
let tools = BIPUtil.ServApi;

const state : AssistState = {
    aidInfos: new Map<string,AIdAssist>(),//辅助ID,对象信息
    keyMaps: new Map<string,boolean>(),//辅助ID,是否正在访问
    aidValues: new Map<string,any>(),//辅助ID+查询条件,values值
    clInfos:new Map<string,any>()
}

const getters: GetterTree<AssistState, RootState> = {
    AID_INFOS(state) : Map<string,AIdAssist> {
        return state.aidInfos
    },
    KEY_MAPS(state) : Map<string,boolean> {
        return state.keyMaps
    },

    AID_VALUES(state) : Map<string,any> {
       return state.aidValues
    },
    CL_INFOS(state) : Map<string,any>{
        return state.clInfos
    }
  }

  const mutations :MutationTree<AssistState> = {
    setAidInfo:(state:AssistState,vals:any) => {
        if(vals && vals.value){
            state.aidInfos.set(vals.key,vals.value);
            state.aidInfos = new Map(state.aidInfos);
            window.sessionStorage.setItem(vals.key,JSON.stringify(vals.value))
        }
    },
    setKeyMap:(state:AssistState,key:string)=>{
        state.keyMaps.set(key,true);
        state.keyMaps = new Map(state.keyMaps);
        // state.keyMaps = Object.assign({},state.keyMaps);
    },
    setAidValue:(state:AssistState,vals:any) => {
        if(vals && vals.value){
            state.aidValues.set(vals.key,vals.value);
            state.aidValues = new Map(state.aidValues);
            // state.aidValues = Object.assign({},state.aidValues);
            window.sessionStorage.setItem(vals.key,JSON.stringify(vals.value))
        }
    },
    setCLInfo:(state:AssistState,vals:any)=>{
        if(vals && vals.value){
            state.clInfos.set(vals.key,vals.value);
            state.clInfos = new Map(state.clInfos);
            // state.aidValues = Object.assign({},state.aidValues);
            window.sessionStorage.setItem(vals.key,JSON.stringify(vals.value))
        }
    }


  }

 const actions: ActionTree<AssistState, RootState> = {
    fetchAssist:({commit},val:any): AxiosPromise<AssistState>  => {
        let id = val.id;
        let value = val.value||'';
        let page = val.page||1
        let pageSize = val.pageSize||1
        // console.log(vals,'assist')
        commit('setKeyMap',id);
        return tools.getAidValuesById("&" + id, value, page, pageSize).then(res=>{
            // console.log(res);
            if(res && res.data.id == 0){
                let aidInfo = new AIdAssist(id);
                let vals = res.data.data.values;
                aidInfo.layCells = vals.layCells;
                aidInfo.labers = vals.labers;
                aidInfo.showColsIndex = vals.showColsIndex;
                aidInfo.title = vals.title;
                aidInfo.initOK = true
                commit('setAidInfo',{key:id,value:aidInfo});
                if(vals.values){
                    vals.values.forEach((item:any) => {
                        let keyv = item[vals.layCells[0].id]
                        // console.log(keyv,'bbbbb',id)
                        commit('setAidValue',{key:id+'_'+keyv,value:item});
                    });
                    // commit('setAidValue',{key:id+'_'+value,value:vals.vals.values});
                }
                commit('setAidValue',{key:id+'_'+value,value:vals.values});
                
            }
            return res;
        }).catch(err=>{
            console.log('error',id)
            return err;
        });
    },

    fetchCLById:({commit},key:string): AxiosPromise<AssistState>  => {
        commit('setKeyMap','CL_'+key);
        return tools.getRefById('$'+key,'').then(res=>{
            // console.log(res);
            if(res && res.data.id == 0){
                let r = res.data.data.values
                commit('setCLInfo',{key:'CL_'+key,value:r});
            }
            return res
        }).catch(err=>{
            return err
        })
    },

    fetchRefById:({commit},vals): AxiosPromise<AssistState>  => {
        commit('setKeyMap',vals.key+'_'+vals.model);
        return tools.getAidValuesById('&'+vals.key,vals.cont).then(res=>{
            // console.log(res);
            if(res && res.data.id == 0){
                let r = res.data.data.values
                commit('setAidValue',{key:vals.key+'_'+vals.model,value:r.values});
            }
            return res
        }).catch(err=>{
            return err
        })
    }
 }



const namespaced: boolean = true;


export const assit: Module<AssistState, RootState> = {
    namespaced,
    state,
    getters,
    actions,
    mutations
  };