const SYSTEM_ENV_LIST = ["dev", "prod"] as const;
type SystemEnv = typeof SYSTEM_ENV_LIST[number];

export const getSystemEnv = (): SystemEnv => {
    const systemEnv = process.env.SYSTEM_ENV;

    if (!systemEnv) {
        throw new Error("SYSTEM_ENV is not defined.");
    }

    if (systemEnv !== 'prod' && systemEnv !== 'dev') {
        throw new Error(
            `SYSTEM_ENV is not valid. SYSTEM_ENV: ${systemEnv}`,
        );
    }

    return systemEnv;
}

const CHOBIIT_LANG_LIST = ['ja', 'en'] as const;
type ChobiitLang = typeof CHOBIIT_LANG_LIST[number];

export const getChobiitLang = (): ChobiitLang => {
    const chobiitLang = process.env.CHOBIIT_LANG; 
    
    if (!chobiitLang) {
        throw new Error("CHOBIIT_LANG is not defined.");
    }
    
    if (chobiitLang !== 'ja' && chobiitLang !== 'en') {
        throw new Error(
            `CHOBIIT_LANG is not valid. CHOBIIT_LANG: ${chobiitLang}`,
        );
    }

    return chobiitLang;
}

export const getAwsRegion = (): string => {
    const awsRegion = process.env.CHOBIIT_AWS_REGION;

    if (!awsRegion) {
        throw new Error("CHOBIIT_AWS_REGION is not defined.");
    }

    return awsRegion;
}

export const getChobiitDomainName = (): string => {
    const chobiitDomainName = process.env.CHOBIIT_DOMAIN_NAME;
    
    if (!chobiitDomainName) {
        throw new Error("CHOBIIT_DOMAIN_NAME is not defined.");
    }
    
    return chobiitDomainName;
};