const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { google } = require("googleapis");

//-------------------------------- Google client Setup --------------------------------

// Load Google Drive API credentials
const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../credentials.json"))
).installed;

// Load access and refresh tokens
let tokens = JSON.parse(fs.readFileSync(path.join(__dirname, "../token.json")));

// Function to create an OAuth2 client
const getOAuth2Client = async () => {
  const { client_id, client_secret, redirect_uris } = credentials;

  // Create OAuth2 client with credentials
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Set existing tokens to the OAuth2 client
  oauth2Client.setCredentials(tokens);

  // Refresh token if needed and save new tokens
  oauth2Client.on("tokens", (newTokens) => {
    if (newTokens.refresh_token) {
      tokens.refresh_token = newTokens.refresh_token;
    }
    tokens.access_token = newTokens.access_token;

    // Write the updated tokens back to the token.json file
    fs.writeFileSync(
      path.join(__dirname, "../token.json"),
      JSON.stringify(tokens, null, 2)
    );
  });

  // Automatically handle token refresh if expired
  await oauth2Client.getAccessToken();

  return oauth2Client;
};

//------------ Creating Folder in Google Drive -------------------------------------
// Function to create a folder in Google Drive
const createFolder = async (auth, folderName) => {
  const drive = google.drive({ version: "v3", auth });
  try {
    // Create a folder with the specified name
    const response = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    return response.data.id; // Return folder ID
  } catch (error) {
    console.error("Error creating folder:", error);
    throw new Error("Error creating folder");
  }
};

//-------------- Uploading File to Google Drive -------------------------------------------
// Function to upload a file to Google Drive
const uploadFile = async (auth, folderID, file) => {
  const drive = google.drive({ version: "v3", auth });

  // Update filePath to use 'temporary' directory as specified in Multer setup
  const filePath = path.join(__dirname, "..", "temporary", file.filename);

  console.log("File path:", filePath);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    throw new Error("File does not exist");
  }

  // Determine the MIME type of the file
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  try {
    const fileMetadata = {
      name: file.originalname,
      parents: [folderID],
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    // Upload the file and return the file ID
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    // Clean up local file after upload
    fs.unlinkSync(filePath);
    return response.data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Error uploading file");
  }
};

module.exports = { getOAuth2Client, createFolder, uploadFile };
