import { User } from '@/classes/User';
import { Menu } from '@/classes/Menu';

export interface LoginState {
    isLogin: boolean
    snkey: string
    user: User
    menulist: Menu[]
    isOpenMenu:boolean
    bipComHeight:number
  }