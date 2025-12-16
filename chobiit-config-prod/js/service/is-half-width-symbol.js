export function isHalfWidthSymbol(str){
    str = (str==null)?"":str;
    if(str.match(/^[A-Za-z0-9._@-]*$/) && ['.','-','_','@'].indexOf(str[0]) == -1){
        return true;
    }else{
        return false;
    }
}
