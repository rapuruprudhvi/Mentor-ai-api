import { Router } from 'express';
import * as YAML from "yamljs";
import * as swaggerUi from "swagger-ui-express";

const openApiRouter = Router({ mergeParams: true });

const swaggerDocument = YAML.load('./openapi.yaml');
openApiRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default openApiRouter;
