import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import { fromEnv } from '@aws-sdk/credential-providers';

require('dotenv').config();

export const dbclient = new DynamoDBClient({
  credentials: fromEnv(),
  region: 'us-east-1',
});

export const TABLE_NAME = 'movie-night-table';

export const createParams = <T>(attrs: Omit<T, 'TableName'>): T => {
  return { TableName: TABLE_NAME, ...attrs } as T;
};

export const simplify = (data: Record<string, any>): any => {
  if (data.L) {
    return data.L.map((item: Record<any, any>) => simplify(item));
  } else if (data.M) {
    return Object.entries(data.M).reduce(
      (e, [key, val]) => {
        e[key] = simplify(val as Record<string, any>);
        return e;
      },
      {} as Record<string, any>,
    );
  } else if (data.S || data.S === '') {
    return data.S;
  } else if (data.BOOL || data.BOOL === false) {
    return data.BOOL;
  } else if (data.N || data.N === 0) {
    return parseInt(data.N, 10);
  }
  return data;
};

export const simplifyItem = (item: Record<string, AttributeValue>) =>
  Object.entries(item).reduce(
    (simplifiedItems, [key, val]) => {
      simplifiedItems[key] = simplify(val);
      return simplifiedItems;
    },
    {} as Record<string, any>,
  );

export const parseItemsArray = (items: Record<string, AttributeValue>[]) => {
  return items.map((item) => {
    return simplifyItem(item);
  });
};
