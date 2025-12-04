import { request } from '@playwright/test';

const API_BASE_URL = 'http://localhost:5222';

export async function deleteUser(userId: string, authToken?: string | null) {
  const context = await request.newContext({
    baseURL: API_BASE_URL,
    extraHTTPHeaders: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });

  try {
    const response = await context.delete(`/api/User/${userId}`);

    if (!response.ok()) {
      console.warn(`Failed to delete user ${userId}: ${response.status()}`);
    }
  } catch (error) {
    console.warn(`Error deleting user ${userId}:`, error);
  } finally {
    await context.dispose();
  }
}

export async function deletePasswordEntry(entryId: string, authToken?: string | null) {
  const context = await request.newContext({
    baseURL: API_BASE_URL,
    extraHTTPHeaders: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });

  try {
    const response = await context.delete(`/password-entry/${entryId}`);
    if (!response.ok()) {
      console.warn(`Failed to delete password entry ${entryId}: ${response.status()}`);
    }
  } catch (error) {
    console.warn(`Error deleting password entry ${entryId}:`, error);
  } finally {
    await context.dispose();
  }
}

export async function deletePasswordEntries(entryIds: string[], authToken?: string) {
  for (const id of entryIds) {
    await deletePasswordEntry(id, authToken);
  }
}

export async function deleteUsers(userIds: string[], authToken?: string) {
  for (const id of userIds) {
    await deleteUser(id, authToken);
  }
}

export async function getAuthTokenFromCookies(cookies: any[]): Promise<string | undefined> {
  const authCookie = cookies.find((c) => c.name === 'AuthToken');
  return authCookie?.value;
}
