import { ApolloServer } from "@apollo/server";
import { schema } from "./schema.ts";
import { MongoClient } from "mongodb";
import { TeacherModel } from "./types.ts";
import { StudentModel } from "./types.ts";
import { CourseModel } from "./types.ts";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  throw new Error("Please provide a MONGO_URL");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Connected to MongoDB");

const mongoDB = mongoClient.db("Class");
const TeacherCollection = mongoDB.collection<TeacherModel>("teacher");
const StudentCollection = mongoDB.collection<StudentModel>("student");
const CourseCollection = mongoDB.collection<CourseModel>("course");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async () => ({ TeacherCollection, StudentCollection, CourseCollection }),
});

console.info(`Server ready at ${url}`);