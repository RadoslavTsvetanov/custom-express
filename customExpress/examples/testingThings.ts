import { builtIns } from "../src/app";
import { WebRouter, type RequestHandler } from "../src/app";
import { ResponseStatus } from "../src/app";
import { ApiPath } from "../types/apiApth";
import { Port } from "../types/networking/port";
import { responses, responsesStatuses } from "../utils/responses";
import { FileName } from "../types/filename";
import { typeSafeTryCatch } from "../utils/try-catch-type-safe-handler";

interface MyContext {
  userService: {
    getUsers: () => Promise<string[]>;
  };
}

interface UserResponse {
  users: string[];
}

const getUsersHandler: RequestHandler<
  MyContext,
  undefined,
  {},
  UserResponse
> = async (req, res, next, ctx) => {
  try {
    const users = await ctx.userService.getUsers();
    return responses.found({ users });
  } catch (error) {
    return {
      status: new ResponseStatus(500),
      data: { error: "Internal Server Error" },
    };
  }
};

const myContext: MyContext = {
  userService: {
    getUsers: async () => ["User1", "User2", "User3"], // Example user data
  },
};

const webRouter = new WebRouter({});

webRouter.withMiddlewares(
  builtIns.middlewares.fileUploading.defaultFileUpload(new FileName("file"))
);

webRouter.post<{}, { file: File }, { hui: string }>(
  "/new",
  async (req, res, next, ctx) => {
    // note that the file uploaded using formdata must be called file

    /*
  
  Example

    const formData = new FormData();
    formData.append("file", file);

  */

    typeSafeTryCatch(
      async () => {
        return {
          file: req.file,
        };
      },
      async (e) => {
        return {
          status: new ResponseStatus(500),
          data: { error: e.message },
        };
      }
    );

    return responses.found({ error: "hi" });
  }
);

const userWebRouter = new WebRouter(myContext);
userWebRouter.get("/", getUsersHandler);

userWebRouter.post<
  { name: string },
  { organization: string },
  { name: string; organization: string }
>("/", async (req, res, next, ctx) => {
  try {
    return responses.succesfullyCreatedEntityReturningTheEntity({
      organization: req.params.organization,
      name: req.body.name,
    });
  } catch (err) {
    return {
      status: new ResponseStatus(500),
      data: { error: "Internal Server Error" },
    };
  }
});

webRouter.addSubRouter(new ApiPath("/users"), userWebRouter.getExpressRouter());

const port = new Port(3004);
webRouter.start(port);
