import faker from "faker";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { GuestbookSignature } from "./db";

dotenv.config();

export interface GuestbookSignature {
  name: string;
  message?: string;
}

export interface GuestbookSignatureWithId extends GuestbookSignature {
  _id: ObjectId;
}

// Connection URI
const uri = process.env.DATABASE_URL;

if (!uri)
  throw new Error(
    "No database URL specified in environment variables. Have you set up a .env file?"
  );

// Create a new MongoClient
const client = new MongoClient(uri);
client.connect();

const db = client
  .db("guestbook-signature")
  .collection<GuestbookSignature>("signatures");

/**
 * Adds in some dummy guestbook signatures to the database
 *
 * @param n - the number of signatures to generate
 * @returns the created signatures
 */
export const addDummyGuestbookSignatures = async (
  n: number
): Promise<GuestbookSignatureWithId[]> => {
  const createdSignatures: GuestbookSignatureWithId[] = [];
  for (let count = 0; count < n; count++) {
    const createdSignature = await addGuestbookSignature({
      name: faker.name.findName(), // random fake name
      message: faker.lorem.sentences(3), // random fake message
    });
    createdSignatures.push(createdSignature);
  }
  return createdSignatures;
};

/**
 * Adds in a single signature to the database
 *
 * @param data - the signature data to insert in
 * @returns the signature added (with a newly created id)
 */
export const addGuestbookSignature = async (
  data: GuestbookSignature
): Promise<GuestbookSignatureWithId> => {
  const newEntry: GuestbookSignature = {
    ...data,
  };
  const res = await db.insertOne(newEntry);
  // TODO: pick up from here - getting back the inserted signature
  // @ts-ignore
  return newEntry;
  // return res.;
};

/**
 * Deletes a guestbook signature with the given id
 *
 * @param id - the id of the guestbook signature to delete
 * @returns the deleted guestbook signature (if originally located),
 *  otherwise the string `"not found"`
 */
export const deleteGuestbookSignatureById = (
  id: number
): GuestbookSignatureWithId | "not found" => {
  const idxToDeleteAt = findIndexOfGuestbookSignatureById(id);
  if (typeof idxToDeleteAt === "number") {
    const signatureToDelete = getGuestbookSignatureById(id);
    db.splice(idxToDeleteAt, 1); // .splice can delete from an array
    return signatureToDelete;
  } else {
    return "not found";
  }
};

/**
 * Finds the index of a guestbook signature with a given id
 *
 * @param id - the id of the guestbook signature to locate the index of
 * @returns the index of the matching guestbook signature,
 *  otherwise the string `"not found"`
 */
const findIndexOfGuestbookSignatureById = (
  id: number
): number | "not found" => {
  const matchingIdx = db.findIndex((entry) => entry.id === id);
  // .findIndex returns -1 if not located
  if (matchingIdx >= 0) {
    return matchingIdx;
  } else {
    return "not found";
  }
};

/**
 * Find all guestbook signatures
 * @returns all guestbook signatures from the database
 */
export const getAllGuestbookSignatures = async (): Promise<
  GuestbookSignatureWithId[]
> => {
  const res = await client
    .db("guestbook-server")
    .collection("signatures")
    .find();
  return res.toArray();
};

/**
 * Locates a guestbook signature by a given id
 *
 * @param id - the id of the guestbook signature to locate
 * @returns the located guestbook signature (if found),
 *  otherwise the string `"not found"`
 */
export const getGuestbookSignatureById = (
  id: number
): GuestbookSignatureWithId | "not found" => {
  const maybeEntry = db.find((entry) => entry.id === id);
  if (maybeEntry) {
    return maybeEntry;
  } else {
    return "not found";
  }
};

/**
 * Applies a partial update to a guestbook signature for a given id
 *  based on the passed data
 *
 * @param id - the id of the guestbook signature to update
 * @param newData - the new data to overwrite
 * @returns the updated guestbook signature (if one is located),
 *  otherwise the string `"not found"`
 */
export const updateGuestbookSignatureById = (
  id: number,
  newData: Partial<GuestbookSignature>
): GuestbookSignatureWithId | "not found" => {
  const idxOfEntry = findIndexOfGuestbookSignatureById(id);
  // type guard against "not found"
  if (typeof idxOfEntry === "number") {
    return Object.assign(db[idxOfEntry], newData);
  } else {
    return "not found";
  }
};
