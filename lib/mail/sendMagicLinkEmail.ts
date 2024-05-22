import { MagicLinkToken } from '@prisma/client';
import { sendEmailHtml } from './ses';
import { APP_AUTH_CALLBACK_URL, APP_SUPPORT_MAILTO, IS_PROD } from '@lib/constants';
import { Logger } from '@lib/logger';

/**
 * Generates an HTML template for the magic link email.
 * @see https://jsfiddle.net/chozzz/9dm2014q/9/
 * @param magicLink - The magic link token containing the token and expiration information.
 * @returns The generated HTML template.
 */
const generateHtmlTemplateWeb = (magicLink: MagicLinkToken) => {
  const { token, otpCode } = magicLink;
  const brandImageUrl = 'https://portal.bakabit.com/static/brand/bakabit-white.png';
  const magicLinkUrl = `${APP_AUTH_CALLBACK_URL}?type=magic&token=${token}`;
  const linkExpiration = '3 minutes';
  return `
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #282b31;color: #d4d5df;font-family: 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif;padding: 20px;line-height: 24px;">
      <div>
        <table cellpadding="10" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; border-collapse: collapse;">
          <tbody>
            <tr>
              <td style="text-align: center;">
                <img src="${brandImageUrl}" width="210" height="140" alt="Bakabit white logo" style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0px; padding-right:0; padding-left:0">
              </td>
            </tr>
            <tr>
              <td>
                <h1>Your Secure Sign-In Options</h1>
                <p style="margin: 20px 0">To provide you with secure access to your account, we've generated two sign-in options for you. You can choose the one that's most convenient:</p>
              </td>
            </tr>
            <tr>
              <td>
                <h3>Authentication Code:</h3>
                <p>Use this code to sign in manually: <strong style="font-size: 20px;">${otpCode}</strong></p>
              </td>
            </tr>
            <tr>
              <td>
                <h3>Magic Link:</h3>
                <p>Click below to sign in automatically.</p>
                <a href="${magicLinkUrl}" target="_blank" style="min-width: 196px;border-width: 12px 24px;border-style: solid;border-color: rgb(46, 166, 100);border-radius: 4px;background-color: rgb(0, 119, 58) !important;color: rgb(255, 255, 255);font-size: 17px;line-height: 28px;word-break: break-word;display: inline-block;text-align: center;font-weight: 900;text-decoration: none !important;">Sign me in</a>
              </td>
            </tr>
            <tr>
              <td>
                <h4>
                  Note That:
                </h4>
                <ul style="line-height: 16px">
                  <li>
                    <p>Each sign-in option is valid for <strong>${linkExpiration}</strong> only.</p>
                  </li>
                  <li>
                    <p>Each option can be used <strong>once</strong> for a single sign-in attempt.</p>
                  </li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>
                <hr />
              </td>
            </tr>
            <tr>
              <td style="font-size: 15px;">
                <p>If you did not request this login link, you can safely ignore this email. Your account remains secure.</p>
                <p>Need help or have concerns? Contact our support team any time at <a href="mailto:${APP_SUPPORT_MAILTO}" style="color: #f5f5f5; text-decoration: underline;">${APP_SUPPORT_MAILTO}</a></p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>
  `;
};

/**
 * Generates an HTML template for the OTP Code.
 * @param magicLink - The magic link token containing the token and expiration information.
 * @returns The generated HTML template.
 */
const generateHtmlTemplateGPT = (magicLink: MagicLinkToken) => {
  const { otpCode } = magicLink;
  const brandImageUrl = 'https://portal.bakabit.com/static/brand/bakabit-white.png';
  const linkExpiration = '3 minutes';
  return `
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #282b31;color: #d4d5df;font-family: 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif;padding: 20px;line-height: 24px;">
      <div>
        <table cellpadding="10" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; border-collapse: collapse;">
          <tbody>
            <tr>
              <td style="text-align: center;">
                <img src="${brandImageUrl}" width="210" height="140" alt="Bakabit white logo" style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0px; padding-right:0; padding-left:0">
              </td>
            </tr>
            <tr>
              <td>
                <h1>Your Secure Sign-In Options</h1>
                <p style="margin: 20px 0">To provide you with secure access to your account, we've generated two sign-in options for you. You can choose the one that's most convenient:</p>
              </td>
            </tr>
            <tr>
              <td>
                <h3>Authentication Code:</h3>
                <p>Use this code to sign in manually: <strong style="font-size: 20px;">${otpCode}</strong></p>
              </td>
            </tr>
            <tr>
              <td>
                <h4>
                  Note That:
                </h4>
                <ul style="line-height: 16px">
                  <li>
                    <p>This one-time password is valid for <strong>${linkExpiration}</strong> only.</p>
                  </li>
                </ul>
              </td>
            </tr>
            <tr>
              <td>
                <hr />
              </td>
            </tr>
            <tr>
              <td style="font-size: 15px;">
                <p>If you did not request this login link, you can safely ignore this email. Your account remains secure.</p>
                <p>Need help or have concerns? Contact our support team any time at <a href="mailto:${APP_SUPPORT_MAILTO}" style="color: #f5f5f5; text-decoration: underline;">${APP_SUPPORT_MAILTO}</a></p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>
  `;
};

export const sendMagicLinkEmail = async (recipientEmail: string, magicLink: MagicLinkToken, purpose: 'gpt' | 'web') => {
  if ( !IS_PROD ) {
    Logger.withTag('dev-only').log(`Your OTP Code is ${ magicLink.otpCode }`);
    return true;
  }

  let htmlTemplate = '';

  if (purpose === 'gpt') {
    htmlTemplate = generateHtmlTemplateGPT(magicLink);
  } else {
    htmlTemplate = generateHtmlTemplateWeb(magicLink);
  }

  const res = await sendEmailHtml(null, recipientEmail, 'Your Secure Sign-In Options', {
    Html: {
      Charset: 'UTF-8',
      Data: htmlTemplate,
    },
  });

  Logger.withTag('MAIL').log('Magic link email sent', { res });
  return !!res;
};
