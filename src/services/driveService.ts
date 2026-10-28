export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  size?: string;
  owners?: Array<{ displayName: string; emailAddress?: string }>;
}

export async function searchGoogleDrive(
  accessToken: string,
  queryText: string,
  pageSize: number = 20
): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> {
  try {
    let q = "trashed = false";
    if (queryText && queryText.trim().length > 0) {
      const sanitized = queryText.replace(/'/g, "\\'");
      q += ` and (name contains '${sanitized}' or fullText contains '${sanitized}')`;
    }

    const fields = 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, thumbnailLink, modifiedTime, size, owners)';
    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.set('q', q);
    url.searchParams.set('fields', fields);
    url.searchParams.set('pageSize', String(pageSize));
    url.searchParams.set('orderBy', 'modifiedTime desc');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Google Drive API Error: ${res.status}`);
    }

    const data = await res.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Error querying Google Drive API:', error);
    throw error;
  }
}
