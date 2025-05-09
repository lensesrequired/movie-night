import { createParams, dbclient } from '@/server/dynamodb';
import { QueryCommand, QueryCommandOutput } from '@aws-sdk/client-dynamodb';

export const checkHasAccess = async (
  id: string,
  email: string,
): Promise<false | QueryCommandOutput> => {
  return dbclient
    .send(
      new QueryCommand(
        createParams({
          Limit: 1,
          KeyConditionExpression: 'PK = :email AND SK = :watchlist',
          ExpressionAttributeValues: {
            ':email': { S: `USER#${email}` },
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
