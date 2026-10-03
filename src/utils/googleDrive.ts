export const getOrCreateBackupFolder = async (accessToken: string): Promise<string> => {
  // 1. Search for the 'APK_Studio_Backups' folder
  const query = encodeURIComponent("name = 'APK_Studio_Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const listResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listResponse.ok) {
    const error = await listResponse.json();
    throw new Error(error.error?.message || 'Failed to search for backup folder in Google Drive');
  }

  const listData = await listResponse.json();
  if (listData.files && listData.files.length > 0) {
    return listData.files[0].id;
  }

  // 2. Folder does not exist, create it
  const createResponse = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'APK_Studio_Backups',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(error.error?.message || 'Failed to create backup folder in Google Drive');
  }

  const createData = await createResponse.json();
  return createData.id;
};

export const uploadToDrive = async (
  blob: Blob,
  fileName: string,
  accessToken: string,
  parentId?: string
) => {
  const metadata: any = {
    name: fileName,
    mimeType: blob.type || 'application/octet-stream',
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload to Google Drive');
  }

  return await response.json();
};

export const uploadBackupToDrive = async (
  backupData: any,
  fileName: string,
  accessToken: string
) => {
  const folderId = await getOrCreateBackupFolder(accessToken);
  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return await uploadToDrive(blob, fileName, accessToken, folderId);
};
