/**
 * run example:
 * AWS_PROFILE_NAME=main-s3 LOCALE=en IS_TEST=false FILE_NAMES=add-record.js,detail-record.js,list-app.js npx ts-node scripts/prod-command-generator.ts
 */

// define constants
const locales = ["ja", "en"] as const;
const fileNames = [
  "add-record.js", 
  "auth.js", 
  "config.js", 
  "detail-record.js", 
  "forgot-password.js", 
  "list-app.js", 
  "list-record.js", 
  "login.js", 
  "logout.js", 
  "main.js", 
  "p-add-record.js", 
  "p-detail-record.js", 
  "p-list-record.js", 
  "p-thanks.js", 
  "register.js", 
  "thanks.js", 
  "user-info.js", 
  "verify.js",

  // not targets
  // "save-record-utility.js", 
  // "app-utility.js", 
  // "change-color-utiliy.js", 
] as const;

const bucketNames = {
  ja: "chobiit-client-prod",
  en: "chobiit-client-us",
}

const testDomainName = {
  ja: "xf64e",
  en: "novelworks",
}

const commonDirectory = "chobiit-common"; 

// define types
type Locale = typeof locales[number];
type FileName = typeof fileNames[number];

// input 
const locale = process.env.LOCALE as Locale;
const isTest = process.env.IS_TEST === "true";
const awsProfleName = process.env.AWS_PROFILE_NAME || "default";
const fileNamesString = process.env.FILE_NAMES; // separated by comma

// validation
if (!locale || !locales.includes(locale)) {
  throw new Error("LOCALE is not defined.");
}

if (!fileNamesString) {
  throw new Error("FILE_NAMES is not defined.");
}

const fileNamesArray = fileNamesString.split(",") as FileName[];
const invalidFileNames = fileNamesArray.filter(fileName => !fileNames.includes(fileName));
if (invalidFileNames.length > 0) {
  throw new Error(`Invalid FILE_NAMES: ${invalidFileNames}`);
}

const fileNamesSet = new Set(fileNamesArray);
const fileNamesSetArray = Array.from(fileNamesSet);
const domainDirectory = isTest ? testDomainName[locale] : commonDirectory

// output commands
for (const fileName of fileNamesSetArray) {
  const uploadPath = `AWS_PROFILE=${awsProfleName} aws s3 cp build/${locale}/prod/${fileName} s3://${bucketNames[locale]}/public/${domainDirectory}/js/${fileName}`
  console.info(uploadPath);
}
