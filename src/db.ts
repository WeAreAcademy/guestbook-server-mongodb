import faker from "faker";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

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
  .db("guestbook-server")
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
  const newId = res.insertedId;
  const createdResult = await db.findOne({ _id: newId });

  if (createdResult) {
    return createdResult;
  } else {
    throw new Error("Failed to create a signature");
  }
};

/**
 * Deletes a guestbook signature with the given id
 *
 * @param id - the id of the guestbook signature to delete
 * @returns the deleted guestbook signature (if originally located),
 *  otherwise the string `"not found"`
 */
export const deleteGuestbookSignatureById = async (
  id: string
): Promise<GuestbookSignatureWithId | "not found"> => {
  const signatureToDelete = await getGuestbookSignatureById(id);
  await db.deleteOne({ _id: new ObjectId(id) });
  return signatureToDelete;
};

/**
 * Find all guestbook signatures
 * @returns all guestbook signatures from the database
 */
export const getAllGuestbookSignatures = async (): Promise<
  GuestbookSignatureWithId[]
> => {
  const res = db.find({});
  return res.toArray();
};

/**
 * Locates a guestbook signature by a given id
 *
 * @param id - the id of the guestbook signature to locate
 * @returns the located guestbook signature (if found),
 *  otherwise the string `"not found"`
 */
export const getGuestbookSignatureById = async (
  id: string
): Promise<GuestbookSignatureWithId | "not found"> => {
  const maybeEntry = await db.findOne({ _id: new ObjectId(id) });
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
export const updateGuestbookSignatureById = async (
  id: string,
  newData: Partial<GuestbookSignature>
): Promise<GuestbookSignatureWithId | "not found"> => {
  await db.updateOne({ id: new ObjectId(id) }, { $set: newData });
  return getGuestbookSignatureById(id);
};
