'use server';
import { Body, SESClient, SESClientConfig, SendEmailCommand, SendEmailCommandInput, SendEmailCommandOutput } from '@aws-sdk/client-ses';
import { Logger } from '../logger';

export async function sendEmailHtml(from: string | null | undefined, to: string, subject: string, body: Body): Promise<SendEmailCommandOutput | null> {
  // Check if SES configuration is setup, if it's not setup log it and return null
  if (!process.env.AWS_SES_REGION || !process.env.AWS_SES_ACCESS_KEY || !process.env.AWS_SES_SECRET) {
    Logger.withTag('action|sendEmailHtml').error('SES configuration not setup properly in environment variables - Failed to send email to', to);
    return null;
  }

  const SESConfig: SESClientConfig = {
    region: process.env.AWS_SES_REGION,
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY || '',
      secretAccessKey: process.env.AWS_SES_SECRET || '',
    },
  };

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
