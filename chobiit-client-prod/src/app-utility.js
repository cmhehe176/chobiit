module.exports = {
    getAppSetting : getAppSetting
};

function getAppSetting(appId){
    let domain = getKintoneDomain();
    return new Promise((resolve, reject) => {
        let url = window._config.api.getAppSetting.replace(/{appId}/, appId) + '?domain=' + domain ;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.responseText);
                let body = JSON.parse(response.body);
                if (body.code == 200){
                    sessionStorage.setItem('appSetting',JSON.stringify(body.data));
                    resolve(body.data)     
                }else reject(body.error); 
            }
        };
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
    })
}