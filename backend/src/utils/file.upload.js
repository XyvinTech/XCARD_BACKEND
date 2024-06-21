import admin from "firebase-admin";
import getRandomFileName from "../helpers/filename.helper.js";
import { Buffer } from "node:buffer";
import urlParse from 'url-parse';

async function uploadFile(file, directory, fileName) {
  if (file == undefined) {
    return;
  }
  const bucket = admin.storage().bucket(process.env.BUCKET_URL);
  const fullPath = `${directory}/${fileName}${extension(file)}`;
  const bucketFile = bucket.file(fullPath);

  if (file != undefined) {
    await bucketFile.save(file.buffer, {
      contentType: file?.mimetype,
      public: false,
      gzip: true,
    });
    const [url] = await bucketFile.getSignedUrl({
      action: "read",
      expires: "01-01-2099",
    });
    const link = `${process.env.BUCKET_PATH_URL}/${process.env.BUCKET_NAME}${fullPath}`;

    return {
      key: fullPath,
      fileName: `${fileName}${extension(file)}`,
      contentType: file?.mimetype,
      public: url,
      link: link,
    };
  }
  return null;
}
async function uploadSingleDocumentFile(file, directory, fileName) {
  if (file == undefined) {
    return;
  }
  const bucket = admin.storage().bucket(process.env.BUCKET_URL);
  const fullPath = `${directory}/${fileName}${extension(file)}`;
  const bucketFile = bucket.file(fullPath);

  if (file != undefined) {
    await bucketFile.save(file.buffer, {
      contentType: file?.mimetype,
      public: false,
      gzip: true,
    });
    const [url] = await bucketFile.getSignedUrl({
      action: "read",
      expires: "01-01-2099",
    });
    const link = `${process.env.BUCKET_PATH_URL}/${process.env.BUCKET_NAME}${fullPath}`;

    return {
      key: fullPath,
      fileName: `${fileName}${extension(file)}`,
      contentType: file?.mimetype,
      public: url,
      link: link,
    };
  }
  return null;
}

async function uploadBufferFile(file, directory, fileName, section) {
  const bucket = admin.storage().bucket(process.env.BUCKET_URL);
  const fullPath = `${directory}/${fileName}$${section == 'document' ? '' : extension(file)}`;
  console.log('fullpath: ' + fullPath);
  console.log(section);
  const imageBuffer = Buffer.from(file?.buffer, "base64");
  const bucketFile = bucket.file(fullPath);
  await bucketFile.save(imageBuffer, {
    contentType: file.mimeType,
    public: false,
    gzip: true,
  });
  const [url] = await bucketFile.getSignedUrl({
    action: "read",
    expires: "01-01-2099",
  });
  const link = `${process.env.BUCKET_PATH_URL}/${process.env.BUCKET_NAME}${fullPath}`;
  console.log(fullPath);
  return {
    key: fullPath,
    fileName: `${fileName}${section == 'document' ? '' : extension(file)}`,
    contentType: file.mimeType,
    public: url,
    link: link,
  };
}
async function deleteBufferFile(filePath) {
  const bucket = admin.storage().bucket(process.env.BUCKET_URL);
  try {
    await bucket.file(filePath).delete();
    console.log(`File "${filePath}" deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting file "${filePath}":`, error);
  }
}

async function uploadBufferFiles(files, directory) {
  const bucket = admin.storage().bucket(process.env.BUCKET_URL);
  const uploadPromises = files.map(async (image, index) => {
    const randomName = getRandomFileName(`${directory}-`);
    const fullPath = `${directory}/${randomName}${index}${extension(image)}`;
    const imageBuffer = Buffer.from(image?.buffer, "base64");
    const bucketFile = bucket.file(fullPath);
    await bucketFile.save(imageBuffer, {
      contentType: image.mimetype,
      public: false,
      gzip: true,
    });
    const [url] = await bucketFile.getSignedUrl({
      action: "read",
      expires: "01-01-2099",
    });
    const link = `${process.env.BUCKET_PATH_URL}/${process.env.BUCKET_NAME}${fullPath}`;
    return {
      key: fullPath,
      fileName: `${randomName}${extension(image)}`,
      contentType: image.mimetype,
      public: url,
      link: link,
    };
  });
  return Promise.all(uploadPromises)
    .then((urls) => {
      return urls;
    })
    .catch((err) => {
      return Promise.reject();
    });
}

async function uploadFiles(files, directory,asFunction = false) {
  if(asFunction) return null;
  const bucket = admin.storage().bucket(process.env.BUCKET_URL);
  const uploadPromises = files.map(async (image, index) => {
    const randomName = getRandomFileName(`${directory}-`);
    const fullPath = `${directory}/${randomName}${index}${extension(image)}`;
    const bucketFile = bucket.file(fullPath);
    await bucketFile.save(image.buffer, {
      contentType: image.mimetype,
      public: false,
      gzip: true,
    });
    const [url] = await bucketFile.getSignedUrl({
      action: "read",
      expires: "01-01-2099",
    });
    const link = `${process.env.BUCKET_PATH_URL}/${process.env.BUCKET_NAME}${fullPath}`;
    return {
      type: image?.originalname,
      key: fullPath,
      fileName: `${randomName}${extension(image)}`,
      contentType: image.mimetype,
      public: url,
      link: link,
    };
  });
  return Promise.all(uploadPromises)
    .then((urls) => {
      return urls;
    })
    .catch((err) => {
      return Promise.reject();
    });
}

async function deleteFile(key) {
  const bucket = admin.storage().bucket(process.env.BUCKET_URL);
  const bucketFile = bucket.file(key);
  await bucketFile
    .delete()
    .then(() => {
      console.log(`Successfully deleted file`);
    })
    .catch((err) => {
      console.log(`Failed to remove file, error: ${err}`);
    });
}

async function deleteFileByUrl(fileUrl,section = 'all') {
  try {
    // Parse the file URL to get the bucket and file path
    const bucket = admin.storage().bucket(process.env.BUCKET_URL);
    const parsedUrl = urlParse(fileUrl);
    // const bucketName = parsedUrl.hostname.split('.')[0];
    const filePath = parsedUrl.pathname.slice(1).replace(/%24/g, '').replace(/%2F/g,'/');
    // Split the path string by '/'
    const pathParts = filePath.split('/');
    // Take the part before the last element (2nd last element)
    const secondLastPart = pathParts.slice(pathParts.length - 2, pathParts.length).join('/');
    // Delete the file from Firebase Storage
    const part = secondLastPart.split('.');
    const dollarLink = `${part.slice(0,part.length-1).join('.')}$.${part[part.length-1]}`;
    
    await bucket.file(section == 'document'? secondLastPart : dollarLink).delete();
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

const extension = (file) => {
  switch (file.mimetype) {
    case "application/pdf":
      return ".pdf";
    case "image/svg+xml":
      return ".svg";
    case "image/jpeg":
      return ".jpeg";
    case "image/png":
      return ".png";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    default:
      return ".jpeg";
  }
};

export {
  uploadFile,
  uploadBufferFile,
  uploadBufferFiles,
  uploadFiles,
  deleteFile,
  deleteBufferFile,
  deleteFileByUrl,
};
