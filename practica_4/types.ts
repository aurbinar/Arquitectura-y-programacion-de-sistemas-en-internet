import { ObjectId, OptionalId } from "mongodb";

export type usuario = {
    id: ObjectId,
    name: string,
    email: string,
    create_at: Date
}

export type usuarioModel = {
    name: string,
    email: string,
    create_at: Date
}

export type proyecto = {
    id: ObjectId,
    name: string,
    description?: string,
    start_date: string,
    end_date?: string,
    user_id: ObjectId
}

export type projectoModel = {
    name: string,
    description?: string,
    start_date: Date,
    end_date?: Date,
    user_id: ObjectId
}

export type tarea = {
    id: ObjectId,
    title: string,
    description?: string,
    status: string,
    created_at: Date,
    due_date?: Date,
    project_id: ObjectId
}
export type tareaModel = {
    title: string,
    description?: string,
    status: string,
    created_at: Date,
    due_date?: Date,
    project_id: ObjectId
}