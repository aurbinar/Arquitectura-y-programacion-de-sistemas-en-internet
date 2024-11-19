import { MongoClient, ObjectId } from "mongodb";
import { Task, TaskModel } from "./types.ts";

// Fetch the MongoDB connection URL from environment variables
const MONGO_URL = Deno.env.get("MONGO_URL");

// Check if MONGO_URL exists; if not, log an error and exit
if (!MONGO_URL) {
  console.error("MONGO_URL is not set");
  Deno.exit(1);
}

// Create a new MongoDB client and connect to the server
const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected to MongoDB");

const db = client.db("Agenda");
const tasksCollection = db.collection<TaskModel>("tareas");

// Main handler function to manage incoming HTTP requests
const handler = async (req: Request): Promise<Response> => {
  const method = req.method; // Get HTTP method (GET, POST, euserstc.)
  const url = new URL(req.url); // Parse the URL of the request
  const path = url.pathname; // Get the path from the URL
  
  
  if (method === "GET") {
    const tasksdb = await tasksCollection.find().toArray();
    if(path === "/tasks"){

      return new Response(
        JSON.stringify(tasksdb.map(task => ({
          id: task._id.toString(),
          title: task.title,
          completed: task.completed
        }), {status: 200})))
    }
    else if(path.startsWith("/tasks/")){
      const id = path.split("/")[2];

      const tasksID = await tasksCollection.findOne({ _id: new ObjectId(id) });
      if (!tasksID) {
        // If user is not found, return a 404 response
        return new Response(
          JSON.stringify({ error: "Tarea no encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify(tasksdb.find(task => ({
          id: task._id.toString(),
        }), {status: 200})))
    }

  } else if (method === "POST") {
    if(path === "/tasks"){
      const data = await req.json();
      const {title} = data;
      if(!title){
        return new Response(
          JSON.stringify({
            error: "Title are required",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      
      const {insertedId} = await tasksCollection.insertOne({
        title: data.title,
        completed: false,
      });

      return new Response(
        JSON.stringify({
          id: insertedId.toString(),
          title: data.title,
          completed: false
        }), {status: 201});
    }
  } else if (method === "PUT") {
    const data = await req.json();
    const {completed} = data;

    if(path.startsWith("/tasks/")){
      const id = path.split("/")[2];
      console.log(id);

      const tasksID = await tasksCollection.findOne({ _id: new ObjectId(id) });
      if (!tasksID) {
        // If user is not found, return a 404 response
        return new Response(
          JSON.stringify({ error: "Tarea no encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      await tasksCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { completed } },
      );

      const updatedUser = await tasksCollection.findOne({ _id: new ObjectId(id) });

      return new Response(JSON.stringify(updatedUser));
    }
  } else if (method === "DELETE") {
    if(path.startsWith("/tasks/")){
      const id = path.split("/")[2];
      console.log(id);

      const tasksID = await tasksCollection.findOne({ _id: new ObjectId(id) });
      if (!tasksID) {
        // If user is not found, return a 404 response
        return new Response(
          JSON.stringify({ error: "Tarea no encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }
      await tasksCollection.deleteOne({_id: new ObjectId(id)})

      return new Response(JSON.stringify({message: "Tarea eliminada Correctamente"}), {status: 200});
    }
  }
  // If no matching route is found, return a 404 response
  return new Response("Endpoint not found", { status: 404 });
};

// Start the server on port 3000 and use the handler function to process requests
Deno.serve({ port: 3000 }, handler);