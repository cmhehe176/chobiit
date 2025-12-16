const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");
const prompt = require("prompt");
const createLogger = require("../../utility/logger");

/**
 * @const BEFORE_RELEASE_TABLE リリース前のchobitoneAppバックアップテーブル名
 * @const BEFORE_ROLLBACK_TABLE ロールバック前のchobitoneAppバックアップテーブル名
 * @const PRODUCTION_TABLE 本番のchobitoneAppテーブル名
 * @const REGION jp-prod=us-west-1, us-prod=us-east-1, jp/us-dev=ap-southeast-1
 */

const {
  BEFORE_RELEASE_TABLE,
  BEFORE_ROLLBACK_TABLE,
  PRODUCTION_TABLE,
  REGION
} = process.env;

if (!BEFORE_RELEASE_TABLE) {
  throw new Error("BEFORE_RELEASE_TABLE is not set");
}

if (!BEFORE_ROLLBACK_TABLE) {
  throw new Error("BEFORE_ROLLBACK_TABLE is not set");
}

if (!REGION) {
  throw new Error("REGION is not set");
}

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

/**
 * main handler
 */

(async () => {
  const logger = createLogger();

  logger.info("Start chobiit-277-db-rollbacker/index.js");

  const allApps = await scanCurrentAllApps(BEFORE_ROLLBACK_TABLE);
  const updatedApps = allApps.filter(app => app.views);

  logger.info("Number of apps to rollback: " + updatedApps.length);

  if (!updatedApps.length) {
    logger.info("No apps to rollback, exit.");
    return;
  }

  prompt.start();
  const { confirm } = await prompt.get({
    properties: {
      confirm: {
        message: "Are you sure you want to initiate the rollback? (yes/no)"
      }
    }
  });
  logger.info("answer: " + confirm);

  if (confirm.toLowerCase() === "no") {
    logger.info("exit.");
    return;
  }

  for (const app of updatedApps) {
    logger.info(`[${app.domain}/${app.app}] Start rollback`);

    try {
      const oldApp = await getOldApp(BEFORE_RELEASE_TABLE, app.domain, app.app);
      await rollbackApp(PRODUCTION_TABLE, app.domain, app.app, oldApp);
      logger.info(`[${app.domain}/${app.app}] Rollback completed`);
    } catch (error) {
      logger.error(`[${app.domain}/${app.app}] Rollback failed: ${error}`);
    }
  }
})();

/**
 * functions
 */

async function scanCurrentAllApps(tableName) {
  const params = {
    TableName: tableName
  };

  let scanResults = [];
  let items;

  const command = new ScanCommand(params);

  do {
    items = await docClient.send(command);
    items.Items.forEach(item => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != "undefined");
  return scanResults;
}

async function getOldApp(tableName, domain, appId) {
  const params = {
    TableName: tableName,
    Key: {
      domain: domain,
      app: appId
    }
  };

  const command = new GetCommand(params);
  const result = await docClient.send(command);
  return result.Item;
}

async function rollbackApp(tableName, domain, appId, oldApp) {
  const params = {
    TableName: tableName,
    Key: {
      domain: domain,
      app: appId
    },
    UpdateExpression:
      "SET recordCond1 = :recordCond1, calendarView = :calendarView REMOVE #views",
    ExpressionAttributeNames: {
      "#views": "views"
    },
    ExpressionAttributeValues: {
      ":recordCond1": oldApp.recordCond1,
      ":calendarView": oldApp.calendarView
    }
  };

  const command = new UpdateCommand(params);
  await docClient.send(command);
}
