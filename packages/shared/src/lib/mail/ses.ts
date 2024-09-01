'use server';
import { Body, SESClient, SESClientConfig, SendEmailCommand, SendEmailCommandInput, SendEmailCommandOutput } from '@aws-sdk/client-ses';
import { Logger } from '../logger';

const SESConfig: SESClientConfig = {
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SES_SECRET || '',
  },
};

export async function sendEmailHtml(from: string | null | undefined, to: string, subject: string, body: Body): Promise<SendEmailCommandOutput | null> {
  const ses = new SESClient(SESConfig);

  const params: SendEmailCommandInput = {
    Source: from || process.env.AWS_SES_MAIL_FROM || 'no-reply@ingra.ai',
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: body,
    },
  };

  try {
    const sendEmailCommand = new SendEmailCommand(params);
    const result = await ses.send(sendEmailCommand);
    Logger.withTag('action|sendEmailHtml').info('Email sent successfully to:', to);
    return result;
  } catch (error) {
    Logger.withTag('action|sendEmailHtml').error('Error sending email:', error);
    return null;
  }
}
