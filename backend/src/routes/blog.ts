import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";


type Variables = {
    authorId : any
};

export const blogRoute = new Hono< {
    Bindings : {
      DATABASE_URL : string;
      JWT_SECRECT : string;
    },
    Variables : Variables
}>();

blogRoute.use('/*', async(c,next) => {
    try {
        const token = c.req.header('authorization') || "";
        const jwt = token.split(" ")[1];
    
        if (!jwt) {
          c.status(401);
          return c.json({ error: "Token missing" });
        }
        const user = await verify(jwt, c.env.JWT_SECRECT);
    
        if (user) {
          c.set("authorId", user.id);
          await next();
        } else {
          c.status(403);
          return c.json({ error: "Unauthorized" });
        }
    } catch (error) {
        c.status(403);
        return c.json({ error: "Unauthorized or invalid token" });
    }

})


blogRoute.post('/', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const authorId1 = c.get("authorId");
    try {
        const blog = await prisma.post.create({
            data : {
                title : body.title,
                content : body.content,
                authorId : authorId1
            }
        })
        return c.json({
            blogpost : blog 
        });
    } catch(err) {
        c.status(403);
        return c.json({
            msg : "Invalid"
        });
    }
})

blogRoute.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const blogs = await prisma.post.findMany();

    return c.json({
        blogs
    });
})

blogRoute.get('/:id', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const body = await c.req.json();

    try {
        const {id} = c.req.param();
        console.log(id);
        const blog = await prisma.post.findFirst({
            where : {
                id : id
            }, 
        })
        if(!blog) {
            console.log("sorry2")
        }
        console.log(blog);

        return c.json({
            blog
        })
    } catch(err) {
        c.status(411);
        return c.json({
            message : "error while fetching the blog"
        });
    }
});

blogRoute.put('/', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const body = await c.req.json();
    try {
        const blog = await prisma.post.update({
            where : {
                id : body.id
            },
            data : {
                title : body.title,
                content : body.content
            }
        });

        return c.json({
            id : blog.id
        });
    } catch(err) {
        c.status(403);
        return c.json({
            msg : "error occured"
        })
    }
});



