import { Injectable, LoggerService } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class CloudWatchLoggerService implements LoggerService {
    private cloudwatchlogs: AWS.CloudWatchLogs;
    private logGroupName: string;
    private logStreamName: string;

    constructor() {
        this.cloudwatchlogs = new AWS.CloudWatchLogs({ region: 'your-aws-region' });
        this.logGroupName = 'your-log-group-name';
        this.logStreamName = 'your-log-stream-name';
        this.createLogGroupAndStream();
    }

    async createLogGroupAndStream() {
        try {
            await this.cloudwatchlogs
                .createLogGroup({ logGroupName: this.logGroupName })
                .promise();
        } catch (error) {
            if (error.code !== 'ResourceAlreadyExistsException') {
                console.error('Error creating CloudWatch Logs group:', error);
            }
        }

        try {
            await this.cloudwatchlogs
                .createLogStream({
                    logGroupName: this.logGroupName,
                    logStreamName: this.logStreamName,
                })
                .promise();
        } catch (error) {
            if (error.code !== 'ResourceAlreadyExistsException') {
                console.error('Error creating CloudWatch Logs stream:', error);
            }
        }
    }

    async log(message: string, context?: string) {
        await this.sendLogEvent(message, context, 'info');
    }

    async error(message: string, trace?: string, context?: string) {
        await this.sendLogEvent(message, context, 'error', trace);
    }

    async warn(message: string, context?: string) {
        await this.sendLogEvent(message, context, 'warn');
    }

    async debug(message: string, context?: string) {
        await this.sendLogEvent(message, context, 'debug');
    }

    async verbose(message: string, context?: string) {
        await this.sendLogEvent(message, context, 'verbose');
    }
    async sendLogEvent(message: string, context: string, level: string, trace?: string) {
        const logEvent = {
            timestamp: Date.now(),
            message: JSON.stringify({ level, context, message, trace,}),
        };

        try {
            const response = await this.cloudwatchlogs
                .putLogEvents({
                    logGroupName: this.logGroupName,
                    logStreamName: this.logStreamName,
                    logEvents: [logEvent],
                })
                .promise();

            if (response.nextSequenceToken) {
                this.cloudwatchlogs.putLogEvents(
                    {
                        logGroupName: this.logGroupName,
                        logStreamName: this.logStreamName,
                        logEvents: [logEvent],
                        sequenceToken: response.nextSequenceToken,
                    },
                    (error) => {
                        if (error) {
                            console.error('Error sending log event to CloudWatch Logs:', error);
                        }
                    },
                );
            }
        } catch (error) {
            console.error('Error sending log event to CloudWatch Logs:', error);
        }
    }
}
