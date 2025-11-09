import { Router } from 'express';
import { apiReference } from '@scalar/express-api-reference';
import * as fs from 'fs';
import * as yaml from 'yaml';
import * as path from 'path';

const router = Router();


const openApiSpec = yaml.parse(
  fs.readFileSync(path.join(import.meta.dirname, '../docs/openapi.yaml'), 'utf8')
);


router.get('/openapi.json', (_, res) => {
  res.json(openApiSpec);
});


router.use('/docs', apiReference({
  url: '/openapi.json'
}));

export const openapiRouter = router;