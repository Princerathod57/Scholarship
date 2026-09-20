import { Context, Hono } from "hono";
import { handle } from "hono/vercel";
import { AuthConfig, initAuthConfig } from "@hono/auth-js";

// Import new scholarship management API routes
import users from "./users";
import students from "./students";
import programs from "./programs";
import funds from "./funds";
import scholarships from "./scholarships";
import applications from "./applications";
import awards from "./awards";
import disbursements from "./disbursements";
import bankacc from "./bankacc";
import documents from "./documents";
import series from "./series";
import auditlog from "./auditlog";
import bulkupload from "./bulk-upload";
import recommendations from "./recommendations";
import messages from "./messages";

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

function getAuthConfig(c: Context): AuthConfig {
  //@ts-ignore
  return {
    // ...authConfig,
  };
}

const app = new Hono().basePath("/api")

app.use("*", initAuthConfig(getAuthConfig));

const route = app.route("/users", users)
                 .route("/students", students)
                 .route("/programs", programs)
                 .route("/funds", funds)
                 .route("/scholarships", scholarships)
                 .route("/applications", applications)
                 .route("/awards", awards)
                 .route("/disbursements", disbursements)
                 .route("/bank", bankacc)
                 .route("/documents", documents)
                 .route("/series", series)
                 .route("/auditlog", auditlog)
                 .route("/bulk-upload", bulkupload)
                 .route("/recommendations", recommendations)
                 .route("/messages", messages);
                  
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);

export type AppType = typeof route;
