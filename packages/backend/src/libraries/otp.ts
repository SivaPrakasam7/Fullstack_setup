// import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

export const sendOTP = async (PhoneNumber: string, otp: string) => {
    // const params = {
    //     Message: `Your OTP code is: ${otp}`,
    //     PhoneNumber,
    //     MessageAttributes: {
    //         'AWS.SNS.SMS.SenderID': {
    //             DataType: 'String',
    //             StringValue: 'String',
    //         },
    //     },
    // };

    // const sns = new SNSClient({
    //     region: process.env.AWS_REGION!,
    //     credentials: {
    //         accessKeyId: process.env.AWS_ACCESS_KEY!,
    //         secretAccessKey: process.env.AWS_SECRET_KEY!,
    //     },
    // });

    // const command = new PublishCommand(params);

    // const message = await sns.send(command);

    // return message;
    return {};
};
