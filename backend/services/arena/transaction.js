import mongoose from "mongoose";

/*
  Runs `work(session)` inside a MongoDB transaction.
  Transactions need a replica set (MongoDB Atlas always is one).
  For a standalone local mongod set ARENA_NO_TRANSACTIONS=true;
  the unique indexes still guarantee single-match integrity.
*/
export const runInTransaction = async (work) => {
  if (process.env.ARENA_NO_TRANSACTIONS === "true") {
    return work(null);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};
