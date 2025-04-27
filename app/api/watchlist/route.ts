import { createParams, dbclient } from '@/server/dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import { v4 as uuid } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email } = JSON.parse(
    decodeURIComponent(request.cookies.get('info')?.value || '{}'),
  );
  console.log('post', email);

  const { title, description } = await request.json();

  if (!title) {
    return NextResponse.json(
      { _message: 'Title is required' },
      { status: 400 },
    );
  }

  const item: Record<string, AttributeValue> = {
    PK: { S: `USER#${email}` },
    SK: { S: `LIST#${uuid()}` },
    GSI_SK: { S: `LIST#${uuid()}` },
    title: { S: title },
    managedBy: { S: `USER#${email}` },
  };

  if (description) {
    item.description = { S: description };
  }

  return dbclient
    .send(
      new PutItemCommand(
        createParams({
          Item: item,
        }),
      ),
    )
    .then(() => {
      return NextResponse.json({ success: true });
    })
    .catch(async (err) => {
      // log error
      console.log('watchlist create', err);
      return NextResponse.json(
        { _message: 'Watchlist could not be created' },
        { status: 500 },
      );
    });
}
