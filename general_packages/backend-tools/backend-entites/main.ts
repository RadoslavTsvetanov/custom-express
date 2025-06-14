import type { Last } from "@blazyts/better-standard-library";
import express, { Request, Response, Express } from "express";
import { z, ZodObject, ZodRawShape, type infer } from "zod";

// --- Utility Types ---

// --- Action Type ---
type Action<T extends ZodObject<any>, B> = {
  data: z.infer<T> & B;
  schema: ZodObject<any>;
  handler: (v: z.infer<T> & B) => void;
};

// --- Entity Builder ---
class EntityBuilder<
  Befores extends readonly ZodObject<any>[] = [],
  Actions extends Record<string, Action<any, any>> = {}
> {
  private befores: Befores = [] as Befores;
  private actions: Actions = {} as Actions;

  before<T extends ZodObject<ZodRawShape>>(input: {
    data: T;
    handler: (v: z.infer<T>) => void;
  }): EntityBuilder<[...Befores, T], Actions> {
    input.handler(input.data.parse({})); // type-safe dummy usage
    const updated = new EntityBuilder<[...Befores, T], Actions>();
    updated.befores = [...this.befores, input.data] as [...Befores, T];
    updated.actions = this.actions;
    return updated;
  }

  addAction<Name extends string, T extends ZodObject<ZodRawShape>>(
    name: Name,
    input: {
      data: T;
      handler: (v: z.infer<T> & z.infer<Last<Befores>>) => void;
    }
  ): EntityBuilder<
    Befores,
    Actions & { [K in Name]: Action<T, z.infer<Last<Befores>>> }
  > {
    const lastBefore = this.getLastBefore();
    const mergedSchema = lastBefore ? input.data.merge(lastBefore) : input.data;

    const updated = new EntityBuilder<
      Befores,
      Actions & { [K in Name]: Action<T, z.infer<Last<Befores>>> }
    >();
    updated.befores = this.befores;
    updated.actions = {
      ...this.actions,
      [name]: {
        data: {} as any,
        schema: mergedSchema,
        handler: input.handler
      }
    } as any;
    return updated;
  }

  private getLastBefore(): ZodObject<any> | undefined {
    return this.befores.length > 0 ? this.befores[this.befores.length - 1] : undefined;
  }

  getActions() {
    return this.actions;
  }
}

// --- Route Registration ---
function registerEntity(app: Express, prefix: string, entity: EntityBuilder) {
  const actions = entity.getActions();

  for (const [name, action] of Object.entries(actions)) {
    app.post(`/${prefix}/${name}`, (req: Request, res: Response) => {
      const parsed = action.schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.format() });
      }

      try {
        action.handler(parsed.data);
        res.json({ status: "ok" });
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Internal error" });
      }
    });
  }
}

// --- Example Usage ---
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

registerEntity(app, "user", userEntity);

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
