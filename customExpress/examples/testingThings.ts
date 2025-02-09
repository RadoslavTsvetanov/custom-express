import { WebRouter, type RequestHandler } from '../app';
import { ResponseStatus } from '../app';
import  { Port } from '../types/networking/port';
import { responsesStatuses } from '../utils/responses';

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
    return {
      status: responsesStatuses.success,
      data: { users },
    };
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

const webRouter = new WebRouter(myContext);

// Attach the GET route with the handler
webRouter.get('/users', getUsersHandler);

// Example of how you would start the server
const port =  new Port(3000) 
webRouter.start(port);
