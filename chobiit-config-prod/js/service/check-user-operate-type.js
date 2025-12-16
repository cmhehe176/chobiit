const axios = require('axios')


export async function checkUserOperateType(loginName,domain, configApi) {
    const url = `${configApi.checkUserOperateType}?loginName=${loginName}&domain=${domain}`
    try{
        const response = await axios({
            url,
            method: 'GET',
            headers: {
                "Content-Type":"application/json"
            }
        })
        return response.data.operateType
    }catch(error){
        const isExpectedError = error.response?.data?.errorMessage !== undefined
        if(isExpectedError){
            const errorMessage = error.response.data.errorMessage
            console.error(errorMessage)
            throw new Error(errorMessage)
        }else{
            const errorMessage = error.message
            console.error(errorMessage)
            throw new Error(errorMessage)
        }
    }      
}