//for creating files and dir , dynamically
const fs = require("fs");

// to fix relative path issues
const path = require("path");

// for specifying the file format while uploading to google drive
const mime = require("mime-types");

// to use google drive API
const { google } = require("googleapis");

//-------------------------------- Google client Setup --------------------------------

// loading the google credentials
const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../credentials.json"))
).installed;

// loading the access and refresh token
const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../token.json"))
);

const getOAuth2Client = () => {
  const { client_id, client_secret, redirect_uris } = credentials;

  // creating our OAuth2.0 client
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // giving access and refresh tokens to the client
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
};

//------------ creating folder in Google Drive -------------------------------------
// function for creating the folder in google drive
const createFolder = async (authClient, folderName) => {
  const drive = google.drive({ version: "v3", auth: authClient });
  try {
    // resource object contains the metadata for the new file or folder that you want to create.
    //It specifies the details of the item being created.

    const response = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        //The MIME type application/vnd.google-apps.folder is used to indicate that
        // the document we want to create in our drive is a folder.
      },

      // fields specifies which fields should be included in the response from the API
      // in this case , we are taking the id of our doc which is uploaded to google drive
      fields: "id",
    });
    return response.data.id;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw new Error("Error creating folder");
  }
};
//-------------- uploading file to google drive-------------------------------------------
const uploadFile = async (authClient, folderID, file) => {
  const drive = google.drive({ version: "v3", auth: authClient });
  const filePath = path.join(__dirname, "..", "uploads", file.filename);

  // Log the file path to debug
  console.log("File path:", filePath);

  // check if the file exists
  if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    throw new Error("File does not exist");
  }

  // get the mime type of the file
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  try {
    const fileMetadata = {
      name: file.originalname,
      parent: [folderID],
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    fs.unlinkSync(filePath);
    return response.data.id;
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading file");
  }
};

module.exports = { getOAuth2Client, createFolder, uploadFile };
