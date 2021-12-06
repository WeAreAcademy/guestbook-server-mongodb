import faker from "faker";

export interface GuestbookSignature {
  name: string;
  message?: string;
}

export interface GuestbookSignatureWithId extends GuestbookSignature {
  id: number;
}

const db: GuestbookSignatureWithId[] = [];

/** Variable to keep incrementing id of guestbook signatures */
let idCounter = 0;

/**
 * Adds in some dummy guestbook signatures to the database
 *
 * @param n - the number of signatures to generate
 * @returns the created signatures
 */
export const addDummyGuestbookSignatures = (
  n: number
): GuestbookSignatureWithId[] => {
  const createdSignatures: GuestbookSignatureWithId[] = [];
  for (let count = 0; count < n; count++) {
    const createdSignature = addGuestbookSignature({
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
export const addGuestbookSignature = (
  data: GuestbookSignature
): GuestbookSignatureWithId => {
  const newEntry: GuestbookSignatureWithId = {
    id: ++idCounter,
    ...data,
  };
  db.push(newEntry);
  return newEntry;
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
export const getAllGuestbookSignatures = (): GuestbookSignatureWithId[] => {
  return db;
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
