/**
 * 配列の中で指定された値が出現する回数を返す関数
 * 
 * @param arr - 検索対象の配列
 * @param val - 検索する値
 * @returns 指定された値が配列に出現する回数
 */
export function getAllIndexes(arr, val) {
    let  indexes = 0
    for(let i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes++
    return indexes;
}
