import moment from 'moment'
import { GlobalVariable } from './ICL';
export namespace DateUtils {
    class Utils {
        public now(fmt?:string){
            return moment().format(fmt?fmt:GlobalVariable.DATE_FMT_ALL)
        }

        public getDate(v:string,fmt:string):string{
            return moment(v).format(fmt)
        }
    }
    export let DateTool = new Utils()
}