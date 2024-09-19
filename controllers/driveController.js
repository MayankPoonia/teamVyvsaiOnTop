const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const mime = require("mime-types");

// Load OAuth2 client
const getOAuth2Client = () => {
  const { client_secret, client_id, redirect_uris } = JSON.parse(
    fs.readFileSync("credentials.json")
  ).installed;
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  const token = JSON.parse(fs.readFileSync("token.json"));
  oauth2Client.setCredentials(token);
  return oauth2Client;
};

// Create a folder in Google Drive
const createFolder = async (auth, folderName) => {
  const drive = google.drive({ version: "v3", auth });
  try {
    const response = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    return response.data.id;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw new Error("Error creating folder");
  }
};

// Upload a file to Google Drive
const uploadFile = async (auth, folderId, file) => {
  const drive = google.drive({ version: "v3", auth });
  const filePath = path.join(__dirname, "..", "uploads", file.filename);

  // Log the file path to debug
  console.log("File path:", filePath);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    throw new Error("File does not exist");
  }

  // Get the MIME type of the file
  const mimeType = mime.lookup(filePath) || "application/octet-stream"; // Correct method

  try {
    const fileMetadata = {
      name: file.originalname,
      parents: [folderId],
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

    console.log("File uploaded with ID:", response.data.id);

    // Clean up local file after upload
    fs.unlinkSync(filePath); // Remove local file

    return response.data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Error uploading file");
  }
};

module.exports = { getOAuth2Client, createFolder, uploadFile };
