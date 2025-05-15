import { createParams, dbclient } from '@/server/dynamodb';
import { QueryCommand, QueryCommandOutput } from '@aws-sdk/client-dynamodb';

export const checkHasAccess = async (
  id: string,
  username: string,
): Promise<false | QueryCommandOutput> => {
  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 1,
          KeyConditionExpression: 'PK = :username AND SK = :watchlist',
          ExpressionAttributeValues: {
            ':username': { S: `USER#${username}` },
            ':watchlist': { S: `LIST#${id}` },
          },
        }),
      ),
    )
    .then((response) => {
      if (response.Items && response.Items.length) {
        return response;
      }

      console.log(`watchlist access check ${id}`, response);
      return false;
    })
    .catch((err) => {
      console.log(`watchlist access check ${id}`, err);
      return false;
    });
};

export const createInviteCode = (length = 32) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-._-';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });
  return result;
};
