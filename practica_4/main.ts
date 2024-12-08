import { Db, MongoClient, ObjectId } from "mongodb";
import { usuarioModel, projectoModel, tareaModel } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  console.error("Please provide a MONGO_URL");
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected to MongoDB");

const db: Db = client.db("Empresa");

const userCollection = db.collection<usuarioModel>("users");
const projectCollection = db.collection<projectoModel>("projects");
const taskCollection = db.collection<tareaModel>("tasks");

const handler = async (request: Request): Promise<Response> => {
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;

  if (method === "GET") {
    if(path === "/users"){
      const userdb = await userCollection.find().toArray();
      return new Response(
        JSON.stringify(userdb.map(user => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          created_at: user.create_at
        }), {status: 200})))
    }

    else if(path === "/projects"){
      const projectdb = await projectCollection.find().toArray();
      return new Response(
        JSON.stringify(projectdb.map(proy => ({
          id: proy._id.toString(),
          name: proy.name,
          description: proy.description,
          start_date: proy.start_date,
          end_date: proy.end_date,
          user_id: proy.user_id
        }), {status: 200})))
    }

    else if(path === "/tasks"){
      const tasksdb = await taskCollection.find().toArray();
      return new Response(
        JSON.stringify(tasksdb.map(task => ({
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          created_at: task.created_at,
          due_date: task.due_date,
          project_id: task.project_id
        }), {status: 200})))
    }
    else if (path === "/tasks/by-project"){
      const id = url.searchParams.get("project_id");
      console.log(id);

      if(!id){
        return new Response(JSON.stringify({ error: "El ide es necesario" }), {
          status: 400,
        });
      }
      const tasksdb = await taskCollection.find({
        project_id: new ObjectId(id as string)
      }).toArray();
      return new Response(
        JSON.stringify(tasksdb.map(task => ({
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          created_at: task.created_at,
          due_date: task.due_date
        }), {status: 201})));
    }
    else if(path === "/projects/by-user"){
      const id = url.searchParams.get("user_id");

      if(!id){
        return new Response(JSON.stringify({error: "El ide es necesario"}), {
          status: 400,
        });
      }

      const projectdb = await projectCollection.find({
        user_id: new ObjectId(id as string)
      }).toArray();
      return new Response(
        JSON.stringify(projectdb.map(proj => ({
          id: proj._id.toString(),
          name: proj.name,
          description: proj.description,
          start_date: proj.start_date,
          end_date: proj.end_date
        }), {status: 201})));
    }
    
  } else if (method === "POST") {
      if(path === "/users"){
        const body = await request.json();
        const { name, email} = body;
        if (!name || !email) {
          return new Response(
            JSON.stringify({
              error: true,
              message: "El nombre y el email son campos requeridos."
            }),
            {
              status: 400,
            },
          ); 
        }
        const dateNow = new Date()

        const { insertedId } = await userCollection.insertOne({
          name: body.name,
          email: body.email,
          create_at: dateNow,
        });

        return new Response(
          JSON.stringify({
            id: insertedId.toString(),
            name: name,
            email: email,
            create_at: dateNow,
          }), {status: 201});
      }
      if(path === "/projects"){
        const body = await request.json();
        const { name, description, start_date, user_id, end_date} = body;
        if (!name || !start_date || !user_id) {
          return new Response(
            JSON.stringify({
              error: true,
              message: "El nombre, el start_date y el user_id son campos requeridos."
            }),
            {
              status: 400,
            },
          ); 
        }

        const idExists = await userCollection.findOne({  _id: new ObjectId(user_id as string) });
        if (!idExists) {
          return new Response(
            JSON.stringify({ error: "El usuario no está registrado." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { insertedId } = await projectCollection.insertOne({
          name: name,
          description: description,
          start_date: new Date(start_date),
          end_date: end_date,
          user_id: new ObjectId(user_id as string) 
        });

        return new Response(
          JSON.stringify({
            id: insertedId.toString(),
            name: name,
            description: description,
            start_date: start_date,
            end_date: end_date,
            user_id: user_id.toString()
          }), {status: 201});
      }
      if (path === "/tasks"){
        const body = await request.json();
        const {title, description, status,  due_date, project_id} = body;

        if(!title || !description || !project_id){
          return new Response(
            JSON.stringify({
              error: true,
              message: "Titulo, descripcion y project_id son campos requeridos"
            }),
            {
              status: 400,
            }
          );
        }

      const idExists = await projectCollection.findOne({_id: new ObjectId(project_id as string)})
      if(!idExists){
        return new Response(
          JSON.stringify({
            error: "El projecto no esta registrado"
          }),
          {
            status: 400,
          }
        );
      }

      let mystatus;

      if(!status){
        mystatus = "pending";       
      }else if(status === "pending" || status === "in_progress" || status === "completed"){
        mystatus = status;
      }else{
        return new Response(
          JSON.stringify({
            error: "El status tiene que ser pending, in_progress o completed"
          }),
          {
            status: 400,
          }
        );
      }

      const dateNow = new Date()
  
      const {insertedId} = await taskCollection.insertOne({
        title: title,
        description: description,
        status: mystatus,
        created_at: dateNow,
        due_date: due_date,
        project_id: new ObjectId(project_id as string)
      })

      return new Response(
        JSON.stringify({
          id: insertedId.toString(),
          title: title,
          description: description,
          status: mystatus,
          created_at: dateNow,
          due_date: due_date,
          project_id: project_id.toString
        }), {status: 201});
      }
      if(path === "/tasks/move"){
        const body = await request.json();
        const {task_id, destination_project_id, origin_project_id} = body;


        if(!task_id || !destination_project_id){
          return new Response(
            JSON.stringify({
              error: true,
              message: "Task_id y destination_project_id son campos requeridos"
            }),
            {
              status: 400
            }
          );
        }
        if(origin_project_id){
          const taskdb = await taskCollection.findOne({_id: new ObjectId(task_id as string)})
          if(taskdb){
            if(origin_project_id !== taskdb.project_id.toString()){
              console.log(taskdb.project_id, origin_project_id)
              return new Response(
                JSON.stringify({
                  error: true,
                  message: "El proyecto de origen no coincide con el de la base de datos"
                }),
                {
                  status: 400
                }
              )
            }
          }
        }
        await taskCollection.updateOne({_id: new ObjectId(task_id as string)}, 
          {
            $set: {project_id: new ObjectId(destination_project_id as string)}
          },
        );

        const taskdb = await taskCollection.findOne({_id: new ObjectId(task_id as string)})
        if(taskdb){
          return new Response(JSON.stringify({
            message: "Task moved successfully.",
            task: {
              id: taskdb._id.toString(),
              title: taskdb.title,
              project_id: taskdb.project_id.toString(),
            },
          }),
            {
              status: 200
            });
        }
      }
  } else if (method === "DELETE") {
      if(path === "/users"){
        const id = url.searchParams.get("id");

        if (!id) {
          return new Response(JSON.stringify({ error: "El ide es necesario" }), {
            status: 400,
          });
        }

        const { deletedCount } = await userCollection.deleteOne({
          _id: new ObjectId(id as string),
        });

        if (deletedCount === 0) {
          return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
            status: 404,
          });
        }

        return new Response(
          JSON.stringify({ message: "Usuario eliminado exitosamente" }),
          {
            headers: { "content-type": "application/json" },
          },
        );
      }

      else if(path === "/projects"){
        const id = url.searchParams.get("id");

        if (!id) {
          return new Response(JSON.stringify({ error: "El ide es necesario" }), {
            status: 400,
          });
        }

        const { deletedCount } = await projectCollection.deleteOne({
          _id: new ObjectId(id as string),
        });

        if (deletedCount === 0) {
          return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
            status: 404,
          });
        }

        return new Response(
          JSON.stringify({ message: "Proyecto eliminado exitosamente" }),
          {
            headers: { "content-type": "application/json" },
          },
        );
      }
      else if(path === "/tasks"){
        const id = url.searchParams.get("id");

        if (!id) {
          return new Response(JSON.stringify({ error: "El ide es necesario" }), {
            status: 400,
          });
        }

        const { deletedCount } = await taskCollection.deleteOne({
          _id: new ObjectId(id as string),
        });

        if (deletedCount === 0) {
          return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
            status: 404,
          });
        }

        return new Response(
          JSON.stringify({ message: "Tarea eliminada exitosamente" }),
          {
            headers: { "content-type": "application/json" },
          },
        );
      }
  }
  return new Response(null, { status: 404 });
};

Deno.serve({ port: 3000 }, handler);