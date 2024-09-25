import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

import { userRoute } from './routes/user';
import { blogRoute } from './routes/blog';


const app = new Hono< {
  Bindings : {
    DATABASE_URL : string,
    JWT_SECRECT : string
  }
}>();


app.route("/api/v1/user/", userRoute);
app.route("/api/v1/blog", blogRoute);

export default app;
