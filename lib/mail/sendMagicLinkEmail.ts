import { MagicLinkToken } from "@prisma/client";
import { sendEmailHtml } from "./ses";
import { APP_AUTH_CALLBACK_URL, APP_SUPPORT_MAILTO } from "@lib/constants";
import { Logger } from "@lib/logger";

/**
 * Generates an HTML template for the magic link email.
 * @see https://jsfiddle.net/chozzz/9dm2014q/8/
 * @param magicLink - The magic link token containing the token and expiration information.
 * @returns The generated HTML template.
 */
const generateHtmlTemplate = (magicLink: MagicLinkToken) => {
  const { token, expiresAt } = magicLink;
  const brandImageUrl = 'https://portal.bakabit.com/static/brand/bakabit-white.png';
  const magicLinkUrl = `${ APP_AUTH_CALLBACK_URL }?type=magic&token=${ token }`;
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
                <img src="${ brandImageUrl }" width="210" height="140" alt="bakabit white logo" style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0px; padding-right:0; padding-left:0">
              </td>
            </tr>
            <tr>
              <td style="">
                <h1>Use this link to sign in</h1>
                <p style="margin: 20px 0">You requested a magic link to sign in, and here it is! Note that this link expires in <strong>${ linkExpiration }</strong> and can only be used once.</p>
                <a href="${ magicLinkUrl }" target="_blank" style="min-width: 196px;border-width: 12px 24px;border-style: solid;border-color: rgb(46, 166, 100);border-radius: 4px;background-color: rgb(0, 119, 58) !important;color: rgb(255, 255, 255);font-size: 17px;line-height: 28px;word-break: break-word;display: inline-block;text-align: center;font-weight: 900;text-decoration: none !important;">Sign me in</a>
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
                <div>
                  <p>Need help? Contact our support team any time at <a href="mailto:${ APP_SUPPORT_MAILTO }" style="color: #f5f5f5; text-decoration: underline;">${ APP_SUPPORT_MAILTO }</a></p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>
  `;
};

export const sendMagicLinkEmail = async (recipientEmail: string, magicLink: MagicLinkToken) => {
  const htmlTemplate = generateHtmlTemplate(magicLink);

  const res = await sendEmailHtml( null, recipientEmail, 'Sign in to your account', {
    Html: {
      Charset: 'UTF-8',
      Data: htmlTemplate
    }
  } );

  Logger.withTag('MAIL').log('Magic link email sent', { res });
  return !!res;
};
