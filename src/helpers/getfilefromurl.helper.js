import fetch from "node-fetch";

async function getFileFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download file from URL: ${response.status} ${response.statusText}`
    );
  }
  return await response.buffer();
}

export default getFileFromUrl;
