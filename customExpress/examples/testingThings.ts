import { WebRouter, type RequestHandler } from '../app';
import { ResponseStatus } from '../app';
import  { Port } from '../types/networking/port';
import { responses, responsesStatuses } from '../utils/responses';

interface MyContext {
  userService: {
    getUsers: () => Promise<string[]>;
  };
}

interface UserResponse {
  users: string[];
}

const getUsersHandler: RequestHandler<MyContext, undefined, {}, UserResponse> = async (req, res, next, ctx) => {
  try {
    const users = await ctx.userService.getUsers();
    return responses.found({ users }) 
  } catch (error) {
    return {
      status: new ResponseStatus(500),
      data: { error: 'Internal Server Error' },
    };
  }
};


// Initialize the router with context
const myContext: MyContext = {
  userService: {
    getUsers: async () => ['User1', 'User2', 'User3'], // Example user data
  },
};

const webRouter = new WebRouter({});


const userWebRouter = new WebRouter(myContext);
// Attach the GET route with the handler
userWebRouter.get('/', getUsersHandler);


userWebRouter.post<{ name: string }, { organization: string }, { name: string, organization: string }>("/", async(req, res, next, ctx) => {
  try {
    return responses.succesfullyCreatedEntityReturningTheEntity({ organization: req.params.organization, name: req.body.name })
    
  } catch (err) { 
    return {
      status: new ResponseStatus(500),
      data: { error: 'Internal Server Error' },
    };
  }
})

webRouter.withMiddlewares()

const port =  new Port(3000) 
webRouter.start(port);
