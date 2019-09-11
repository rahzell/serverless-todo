import { DynamoDBStreamEvent } from 'aws-lambda';
import { SNS, DynamoDB } from 'aws-sdk';

export interface ISNSService {
    publishToMyTopic(event: DynamoDBStreamEvent): Promise<any>;
}

export class MySNSService implements ISNSService{
    constructor(private snsClient: SNS) { };
    
    async publishToMyTopic(event: DynamoDBStreamEvent): Promise<void> {
        DynamoDB.Converter.unmarshall(event.Records as any as DynamoDB.AttributeMap);

        const table = event.Records[0].eventSourceARN.split('/')[1];
        const details = JSON.stringify(event.Records[0].dynamodb, null, 2);
        const time = new Date(event.Records[0].dynamodb.ApproximateCreationDateTime * 1000);
        const type = event.Records[0].eventName;

        const params = {
            Message: `time: ${time} \n details: \n ${details}`,
            Subject: `${type} happened on table ${table}`,
            TopicArn: process.env.SNS_TOPIC_ARN
        };

        await this.snsClient.publish(params);
    }
}