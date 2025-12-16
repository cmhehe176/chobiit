export function maxUser(allConfigData,limit) {
    switch(process.env.CHOBIIT_LANG) {
        case "ja":
            return limit || limit === 0 ? limit : allConfigData.data.config.maxUser;
        case "en":
            return allConfigData.data.config.maxUser;
    }
}
