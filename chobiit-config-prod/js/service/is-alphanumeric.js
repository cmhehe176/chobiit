export function isAlphanumeric(str){
    str = (str==null)?"":str;
    if(str.match(/^[A-Za-z0-9]*$/)){
      return true;
    }else{
      return false;
    }
}
