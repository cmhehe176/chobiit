export function getDuplicate(arr){
    let duplicates = arr.filter(x => x != false).reduce(function(acc, el, i, arr) {
        if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc;
    }, []);

    return duplicates;
}
