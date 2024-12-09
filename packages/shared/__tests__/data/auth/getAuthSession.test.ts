import { describe, it, expect, vi, Mock } from 'vitest';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { cookies, headers } from 'next/headers';
import { getWebAuthSession, getApiAuthSession, getOAuthAuthSession, clearAuthCaches } from '@repo/shared/data/auth/session/caches';
import { APP_SESSION_API_KEY_NAME } from '@/src/lib/constants';
import { refreshGoogleOAuthCredentials } from '@repo/shared/lib/google-oauth/refreshGoogleOAuthCredentials';
import { updateOAuthToken, revokeOAuth } from '@repo/shared/actions/oauth';
import { GoogleOAuthClient, Credentials } from '@repo/shared/lib/google-oauth/client';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('@repo/shared/lib/google-oauth/client', () => ({
  GoogleOAuthClient: {
    refreshAccessToken: vi.fn(),
    getToken: vi.fn(),
    setCredentials: vi.fn(),
  },
  Credentials: vi.fn(),
}));

vi.mock('@repo/shared/data/auth/session/caches', () => ({
  getWebAuthSession: vi.fn(),
  getApiAuthSession: vi.fn(),
  getOAuthAuthSession: vi.fn(),
}));


vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock('@repo/shared/data/auth/session/caches', () => ({
  getWebAuthSession: vi.fn(),
  getApiAuthSession: vi.fn(),
  getOAuthAuthSession: vi.fn(),
  clearAuthCaches: vi.fn(),
}));

vi.mock('@repo/shared/lib/google-oauth/refreshGoogleOAuthCredentials', () => ({
  refreshGoogleOAuthCredentials: vi.fn(),
}));

vi.mock('@repo/shared/actions/oauth', () => ({
  updateOAuthToken: vi.fn(),
  revokeOAuth: vi.fn(),
}));

describe('getAuthSession', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return session when jwt is provided', async () => {
    const mockJwt = 'mockJwt';
    const mockSession = { user: { id: 'user1' } };
    (cookies as Mock).mockResolvedValueOnce({ get: () => ({ value: mockJwt }) });
    (headers as Mock).mockResolvedValueOnce(new Map());
    (getWebAuthSession as Mock).mockResolvedValueOnce(mockSession);

    const result = await getAuthSession();

    expect(result).toEqual(mockSession);
    expect(getWebAuthSession).toHaveBeenCalledWith(mockJwt);
  });

  it('should return session when x-api-key is provided', async () => {
    const mockApiKey = 'mockApiKey';
    const mockSession = { user: { id: 'user2' } };
    (cookies as Mock).mockResolvedValueOnce({ get: () => null });
    (headers as Mock).mockResolvedValueOnce(new Map([[APP_SESSION_API_KEY_NAME, mockApiKey]]));
    (getApiAuthSession as Mock).mockResolvedValueOnce(mockSession);

    const result = await getAuthSession();

    expect(result).toEqual(mockSession);
    expect(getApiAuthSession).toHaveBeenCalledWith(mockApiKey);
  });

  it('should return session when Auth bearer token is provided', async () => {
    const mockToken = 'mockToken';
    const mockSession = { user: { id: 'user3' } };
    (cookies as Mock).mockResolvedValueOnce({ get: () => null });
    (headers as Mock).mockResolvedValueOnce(new Map([['Authorization', `Bearer ${mockToken}`]]));
    (getOAuthAuthSession as Mock).mockResolvedValueOnce(mockSession);

    const result = await getAuthSession();

    expect(result).toEqual(mockSession);
    expect(getOAuthAuthSession).toHaveBeenCalledWith(mockToken);
  });

  it('should return null when no authentication method is provided', async () => {
    (cookies as Mock).mockResolvedValueOnce({ get: () => null });
    (headers as Mock).mockResolvedValueOnce(new Map());

    const result = await getAuthSession();

    expect(result).toBeNull();
  });

  it('should refresh OAuth tokens when introspectOAuthTokens is true', async () => {
    const mockJwt = 'mockJwt';
    const mockSession = {
      user: {
        id: 'user1',
        email: 'user1@example.com',
        oauthTokens: [{ 
          id: 'token1', isDefault: true, service: 'google-oauth', scope: 'scope1', primaryEmailAddress: 'user2@example.com' 
        }],
      },
    };
    const mockNewCredentials = { 
      access_token: 'newAccessToken', 
      refresh_token: 'newRefreshToken', 
      id_token: 'newIdToken', 
      token_type: 'Bearer', 
      expiry_date: Date.now() + 3600,
      scope: 'scope1',
    };
    const mockUpdatedOAuth = { 
      id: 'token1', 
      expiryDate: new Date(mockNewCredentials.expiry_date)
    };

    (cookies as Mock).mockResolvedValueOnce({ get: () => ({ value: mockJwt }) });
    (headers as Mock).mockResolvedValueOnce(new Map());
    (getWebAuthSession as Mock).mockResolvedValueOnce(mockSession);
    (refreshGoogleOAuthCredentials as Mock).mockResolvedValueOnce({ 
      credentials: mockNewCredentials,
      primaryEmailAddress: 'user3@example.com'
    });
    (updateOAuthToken as Mock).mockResolvedValueOnce({ data: mockUpdatedOAuth });
    (revokeOAuth as Mock).mockResolvedValueOnce(null);

    const result = await getAuthSession({ introspectOAuthTokens: true });

    expect(result).toEqual(mockSession);

    expect(refreshGoogleOAuthCredentials).toHaveBeenCalledWith({
      id: 'token1',
      isDefault: true,
      primaryEmailAddress: "user2@example.com",
      service: 'google-oauth',
      scope: 'scope1',
    });
    
    expect(updateOAuthToken).toHaveBeenCalledWith({
      id: 'token1',
      primaryEmailAddress: "user3@example.com",
      accessToken: mockNewCredentials.access_token,
      refreshToken: mockNewCredentials.refresh_token,
      idToken: mockNewCredentials.id_token,
      tokenType: mockNewCredentials.token_type,
      expiryDate: new Date(mockNewCredentials.expiry_date),
      scope: 'scope1',
      service: 'google-oauth',
    });
  });

  it('should handle error when refreshing OAuth tokens', async () => {
    const mockJwt = 'mockJwt';
    const mockSession = {
      user: {
        id: 'user1',
        email: 'user1@example.com',
        oauthTokens: [{ id: 'token1', isDefault: true, service: 'google-oauth', scope: 'scope1' }],
      },
    };

    (cookies as Mock).mockResolvedValueOnce({ get: () => ({ value: mockJwt }) });
    (headers as Mock).mockResolvedValueOnce(new Map());
    (getWebAuthSession as Mock).mockResolvedValueOnce(mockSession);
    (refreshGoogleOAuthCredentials as Mock).mockRejectedValueOnce(new Error('[Vitest] Failed to refresh token'));
    (revokeOAuth as Mock).mockResolvedValueOnce(null);

    const result = await getAuthSession({ introspectOAuthTokens: true });

    expect(result).toEqual(mockSession);
    expect(refreshGoogleOAuthCredentials).toHaveBeenCalledWith(mockSession.user.oauthTokens[0]);
    expect(revokeOAuth).toHaveBeenCalledWith(mockSession.user.oauthTokens[0]);
  });

});