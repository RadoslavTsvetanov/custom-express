import { AfterfixKeysOfRecord, ITrueMap, OrderedRecord, URecord, With } from "@custom-express/better-standard-library";
import { z, ZodObject, ZodRawShape, ZodSchema, ZodUnknown } from "zod";
import { IncomingMessage } from 'http';

// -------------------------------------
// Utility Types
// -------------------------------------




export type WithKey<T extends URecord> = With<T, "key", string>;
// -------------------------------------
// Message & Channel Types
// -------------------------------------
// -------------------------------------
// Hook Types
// -------------------------------------



