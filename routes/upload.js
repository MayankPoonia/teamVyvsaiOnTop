const express = require("express");
const multer = require("multer");
const { jwtAuthenticate, planCheck } = require("../middleware");
const {
  getOAuth2Client,
  createFolder,
  uploadFile,
} = require("../controllers/driveController");

// Set up Multer for temporary file storage
const temporaryStore = multer({ dest: "temporary/" });

const router = express.Router();

// GET route for rendering the form page
router.get("/", jwtAuthenticate, planCheck, (req, res) => {
  res.render("pages/upload-documents.ejs"); // Render the form
});

// POST route for handling file uploads
router.post(
  "/",
  jwtAuthenticate,
  planCheck,
  temporaryStore.array("files"),
  async (req, res) => {
    try {
      const auth = getOAuth2Client();

      // Create folder in Google Drive using mobile number and tender ID
      const folderName = `${req.body.mobileNo}-${req.body.tenderId}`;
      const folderId = await createFolder(auth, folderName);

      // Upload each file to Google Drive and collect the file IDs
      const fileIds = await Promise.all(
        req.files.map((file) => uploadFile(auth, folderId, file))
      );

      // Render success page and pass uploaded file information
      res.status(200).render("pages/upload-success", { fileIds });
    } catch (error) {
      console.error("Error during file upload:", error);
      res
        .status(500)
        .json({ message: "Error uploading files", error: error.message });
    }
  }
);

module.exports = router;
