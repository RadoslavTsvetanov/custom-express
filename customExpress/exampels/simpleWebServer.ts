import { ResponseStatus, WebRouter } from "../app";
import express from "express";
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
        return {status: new ResponseStatus(200), data: {file: "f"}};
    } else {
        return {status: new ResponseStatus(404), data: "User not found"};
    }
})

const app2 = express()


// type ValidatorObject = Record<
//     string,
//     {   type: string
//         (v: any) => {}
//     }
// >

// function buildRoute(validator,)




app2.use(app.getRouter())

app2.listen(3000, () => {
    console.log('Server is running on port 3000');
});