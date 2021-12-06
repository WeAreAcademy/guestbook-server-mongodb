import express from "express";
import dotenv from "dotenv";
import {
  addDummyGuestbookSignatures,
  addGuestbookSignature,
  deleteGuestbookSignatureById,
  getAllGuestbookSignatures,
  getGuestbookSignatureById,
  GuestbookSignature,
  updateGuestbookSignatureById,
} from "./db";
import filePath from "./filePath";

// loading in some dummy signatures into the database
// (comment out if desired, or change the number)
// addDummyGuestbookSignatures(0);

const app = express();
/** Parses JSON data in a request automatically */
app.use(express.json());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /signatures
app.get("/signatures", async (req, res) => {
  const allSignatures = await getAllGuestbookSignatures();
  res.status(200).json(allSignatures);
});

// POST /signatures
app.post<{}, {}, GuestbookSignature>("/signatures", (req, res) => {
  // to be rigorous, ought to handle non-conforming request bodies
  // ... but omitting this as a simplification
  const postData = req.body;
  const createdSignature = addGuestbookSignature(postData);
  res.status(201).json(createdSignature);
});

// GET /signatures/:id
app.get<{ id: string }>("/signatures/:id", (req, res) => {
  const matchingSignature = getGuestbookSignatureById(parseInt(req.params.id));
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

// DELETE /signatures/:id
app.delete<{ id: string }>("/signatures/:id", (req, res) => {
  const matchingSignature = deleteGuestbookSignatureById(
    parseInt(req.params.id)
  );
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

// PATCH /signatures/:id
app.patch<{ id: string }, {}, Partial<GuestbookSignature>>(
  "/signatures/:id",
  (req, res) => {
    const matchingSignature = updateGuestbookSignatureById(
      parseInt(req.params.id),
      req.body
    );
    if (matchingSignature === "not found") {
      res.status(404).json(matchingSignature);
    } else {
      res.status(200).json(matchingSignature);
    }
  }
);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
