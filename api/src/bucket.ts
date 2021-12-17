import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3,
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent } from 'aws-lambda';

const client = new S3Client({});
const { BUCKET_NAME } = process.env;
const DOC_NAME = 'my-doc.bin';
export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(JSON.stringify(event));
  console.log('Hello !', BUCKET_NAME);
  const getUrl = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: DOC_NAME,
      ResponseContentType: 'application/octet-stream',
    }),
    { expiresIn: 10 },
  );
  const putUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: DOC_NAME,
      ContentType: 'application/octet-stream',
    }),
    { expiresIn: 10 },
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ putUrl, getUrl }),
  };
};
