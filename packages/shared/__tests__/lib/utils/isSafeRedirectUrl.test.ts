import { describe, it, expect } from 'vitest';
import { isSafeRedirectUrl } from '@/src/lib/utils/isSafeRedirectUrl';

describe('isSafeRedirectUrl', () => {
  it('should not allow relative url redirect', () => {
    expect(isSafeRedirectUrl('/relative')).toBe(false);
  });

  it('should return true for allowed domain ingra.ai', () => {
    expect(isSafeRedirectUrl('https://ingra.ai')).toBe(true);
  });

  it('should return true for allowed subdomains of ingra.ai', () => {
    expect(isSafeRedirectUrl('https://docs.ingra.ai')).toBe(true);
    expect(isSafeRedirectUrl('https://chat.ingra.ai')).toBe(true);
    expect(isSafeRedirectUrl('https://hubs.ingra.ai')).toBe(true);
    expect(isSafeRedirectUrl('https://auth.ingra.ai')).toBe(true);
  });

  it('should return true for allowed domain chat.openai.com', () => {
    expect(isSafeRedirectUrl('https://chat.openai.com/aip/g-111/oauth/callback&state=uuid&scope=chatgpt')).toBe(true);
    expect(isSafeRedirectUrl('https://www.openai.com')).toBe(true);
  });

  it('should return true for allowed localhost with port 3000', () => {
    expect(isSafeRedirectUrl('http://localhost:3000')).toBe(true);
  });

  it('should return true for allowed localhost with port 3005', () => {
    expect(isSafeRedirectUrl('http://localhost:3005')).toBe(true);
  });

  it('should return false for localhost with port 3006', () => {
    expect(isSafeRedirectUrl('http://localhost:3006')).toBe(false);
  });

  it('should return false for disallowed domain', () => {
    expect(isSafeRedirectUrl('https://example.com')).toBe(false);
  });

  it('should return false for URL containing javascript:', () => {
    expect(isSafeRedirectUrl('javascript:alert("XSS")')).toBe(false);
  });

  it('should return false for URL containing data:', () => {
    expect(isSafeRedirectUrl('data:text/html,<script>alert("XSS")</script>')).toBe(false);
  });

  it('should return false for URL containing <script> tag', () => {
    expect(isSafeRedirectUrl('https://ingra.ai/<script>alert("XSS")</script>')).toBe(false);
  });

  it('should return false for URL containing encoded <script> tag', () => {
    expect(isSafeRedirectUrl('https://ingra.ai/%3Cscript%3Ealert("XSS")%3C/script%3E')).toBe(false);
  });

  it('should return false for URL containing vbscript:', () => {
    expect(isSafeRedirectUrl('vbscript:msgbox("XSS")')).toBe(false);
  });

  it('should return false for URL containing directory traversal', () => {
    expect(isSafeRedirectUrl('https://ingra.ai/../../etc/passwd')).toBe(false);
  });

  it('should return false for URL containing backslashes', () => {
    expect(isSafeRedirectUrl('https://ingra.ai\\path\\to\\file')).toBe(false);
  });

  it('should return false for invalid URL', () => {
    expect(isSafeRedirectUrl('not a valid url')).toBe(false);
  });
});
