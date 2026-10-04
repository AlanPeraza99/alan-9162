import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../docs/openapi.js";

const docsRouter = Router();

docsRouter.get("/openapi.json", (_req, res) => {
  res.attachment("openapi.json");
  res.json(openApiDocument);
});

docsRouter.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "Documentación del API",
  }),
);

export default docsRouter;
