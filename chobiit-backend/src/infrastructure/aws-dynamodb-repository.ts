import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand, QueryCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  TableName,
  KINTONE_USER_TABLE_NAME,
  APP_TABLE_NAME,
  USER_TABLE_NAME,
  COMMENT_TABLE_NAME,
  DELETED_USER_TABLE
} from "../constants/dynamodb-table-names";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const KINTONE_USER_TABLE_SORT_KEY = "kintoneLoginName";
const APP_TABLE_SORT_KEY = "app";
const USER_TABLE_SORT_KEY = "loginName";
const COMMENT_TABLE_SORT_KEY = "";

type SortKey =
  | typeof KINTONE_USER_TABLE_SORT_KEY
  | typeof APP_TABLE_SORT_KEY
  | typeof USER_TABLE_SORT_KEY
  | typeof COMMENT_TABLE_SORT_KEY;

type GetParams = {
  domain: string;
  sortKeyValue?: string;
};


/**
 * # TODO
 * 各テーブルの項目を定義してReturnにちゃんと型をつけたい
 * というかこれに変えよう(パクろう)かな・・・ https://qiita.com/daisukeArk/items/de9c92e6b650494bfb61
 */
function Repository(tableName: TableName, sortKey: SortKey) {
  return {
    async get({ domain, sortKeyValue }: GetParams): Promise<any> {
      const getCommandKeyParams = {
        TableName: tableName,
        Key: {
          domain: domain
        }
      };

      if (sortKeyValue) {
        getCommandKeyParams.Key[sortKey] = sortKeyValue;
      }

      const command = new GetCommand(getCommandKeyParams);

      const response = await docClient.send(command);
      return response;
    },

    async scan(params): Promise<any>  {
        params.TableName = tableName;

        let scanResults = [];
        let items;

        const command = new ScanCommand(params)
        
        do {
            items = await docClient.send(command);
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey  = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");
        return scanResults;
    },

    async query(params): Promise<any>  {
        params.TableName = tableName;

        const command = new QueryCommand(params)
        
        let queryResults = [];
        let items;

        do {
            items =  await docClient.send(command);
            items.Items.forEach((item) => queryResults.push(item));
            params.ExclusiveStartKey  = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");
    
        return queryResults;
    },

    async update(params): Promise<any>  {
        params.TableName = tableName;

        const command = new UpdateCommand(params)       

        const response = await docClient.send(command);
        return response;
    },

    async create(params): Promise<any>  {
        params.TableName = tableName;

        const command = new PutCommand(params)       

        const response = await docClient.send(command);
        return response;
    }
  };
}

export const userRepository = Repository(USER_TABLE_NAME, USER_TABLE_SORT_KEY);
export const appRepository = Repository(APP_TABLE_NAME, APP_TABLE_SORT_KEY);
export const commentRepository = Repository(COMMENT_TABLE_NAME, COMMENT_TABLE_SORT_KEY);
export const kintoneUserRepository = Repository(KINTONE_USER_TABLE_NAME, KINTONE_USER_TABLE_SORT_KEY);
export const deletedUserRepository = Repository(DELETED_USER_TABLE, USER_TABLE_SORT_KEY);
