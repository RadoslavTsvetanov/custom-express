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




app.get<{}, {userId: number},{file: File}>("/user", (req ,res, next, ctx) => { 
    if(true) {
        return {status: new ResponseStatus(200), data: {file: ctx.db.getUser("")}};
    } else {
        return {status: new ResponseStatus(404), data: "User not found"};
    }
})



// type ValidatorObject = Record<
//     string,
//     {   type: string
//         (v: any) => {}
//     }
// >

// function buildRoute(validator,)

app.withMiddlewares(builtIns.middlewares.fileUploading.defaultFileUpload(new FileName("file")))

app.start(new Port(3003))