/***
 * 用户实体类
 */
export class User{

    private _userCode:string
    private _userName:string
    private _password:string
    private _attr:number = 5

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


}