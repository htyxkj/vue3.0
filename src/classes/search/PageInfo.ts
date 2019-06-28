export default class PageInfo{
    total:number = 0
    currPage:number
    pageSize:number
    index:number = 0
    constructor(page:number =1,size:number = 10){
        this.currPage = page
        this.pageSize = size
    }
}