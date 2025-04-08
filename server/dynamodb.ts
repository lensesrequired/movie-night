import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-providers';

require('dotenv').config();

export const dbclient = new DynamoDBClient({
  credentials: fromEnv(),
  region: 'us-east-1',
});

export const createParams = <T>(attrs: Omit<T, 'TableName'>): T => {
  return { TableName: 'movie-night-table', ...attrs } as T;
};

export const simplify = (data: Record<string, any>): Record<string, any> => {
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
  } else if (data.S) {
    return data.S;
  }
  return data;
};
