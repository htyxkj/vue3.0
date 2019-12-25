/***
 * 用户实体类
 */
import Dept from './Dept'
export class User{

    private _userCode:string
    private _userName:string
    private _password:string
    private _attr:number = 5
    private _deptInfo:Dept = new Dept();
    constructor(userId:string,userName:string,pwd:string){
        this._userCode = userId;
        this._userName = userName;
        this._password = pwd;
    }

    public get userCode(){
        return this._userCode;
    }

    public get attr(){
        return this._attr
    }

    public set attr(value:number){
        this._attr = value
    }
    public set userCode(userId:string){
        this._userCode = userId;
    }

    public get userName() {
        return this._userName;
    }

    public set userName(value) {
        this._userName = value;
    }

    public get password() {
        return this._password;
    }

    public set password(value) {
        this._password = value;
    }

    public get deptInfo() {
        return this._deptInfo;
    }

    public set deptInfo(value:any) {
        this._deptInfo = value;
    }

}