import { builtIns, ResponseStatus, WebRouter } from "../app";
import express from "express";
import { Port } from "../types/networking/port";
import { FileName } from "../types/filename";

interface DB {
    getUser(userId: string): string | null
 }

class ExampleDb implements DB{
    getUser(userId: string): string | null {
        return "hi"
    }
}

const app = new WebRouter({db: new ExampleDb})






// type ValidatorObject = Record<
//     string,
//     {   type: string
//         (v: any) => {}
//     }
// >

// function buildRoute(validator,)

app.withMiddlewares(builtIns.middlewares.fileUploading.defaultFileUpload(new FileName("file")))

app.start(new Port(3003))