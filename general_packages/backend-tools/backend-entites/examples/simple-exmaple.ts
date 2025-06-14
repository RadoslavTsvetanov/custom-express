import { z } from "zod";
import { EntityBuilder } from "../src/EntityBuilder/main";

const userEntity = new EntityBuilder()
  .before({
    data: z.object({ authToken: z.string() }),
    handler: ({ authToken }) => {
      console.log("Auth token:", authToken);
    }
  })
  .addAction("login", {
    data: z.object({ username: z.string(), password: z.string() }),
    handler: ({ username, password, authToken }) => {
      console.log("Login:", username, password, "Auth:", authToken);
    }
  })
  .addAction("logout", {
    data: z.object({ reason: z.string().optional() }),
    handler: ({ reason, authToken }) => {
      console.log("Logout:", reason ?? "no reason", "Auth:", authToken);
    }
  });

// --- Express App Setup ---
const app = express();
app.use(express.json());
