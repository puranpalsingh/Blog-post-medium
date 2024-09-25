import { Hono } from "hono";
import {verify, sign} from "hono/jwt";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export const userRoute = new Hono< {
    Bindings : {
      DATABASE_URL : string,
      JWT_SECRECT : string
    }
}>();
  
  
userRoute.post('/signup', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl : c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    try {
      const user = await prisma.user.create({
        data : {
          email : body.email,
          password : body.password,
        },
      })
      const token = await sign({id : user.id}, c.env.JWT_SECRECT);
  
      return c.json({
        msg : token
      })
    } catch(err) {
      c.status(403);
      return c.json({
        msg : "invalid"  
      });
    }
  
    
  
})
  
userRoute.post('/sigin', async(c) =>{

  const prisma = new PrismaClient({
    datasourceUrl : c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  try {
    const user = await prisma.user.findUnique({
      where : {
        email : body.email,
        password : body.password
      }
    });
    if(!user) {
      c.status(403);
      return c.json({
        error : "user does not exist"
      });
    }
    
    const token = await sign({id : user.id}, c.env.JWT_SECRECT);
    return c.json({
      token
    });
  } catch(err) {
    c.status(400);
    return c.json({
      msg : err
    });
  }

  
})