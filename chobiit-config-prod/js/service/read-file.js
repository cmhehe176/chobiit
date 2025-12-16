export async function readFile(file){
    return new Promise((resolve, reject) => {
        try {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsText(file,'Shift_JIS');
        }catch(err){
            reject(err)
        }
    })
}
