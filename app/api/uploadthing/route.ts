import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

// https://docs.uploadthing.com/getting-started/appdir#setting-up-your-environment
