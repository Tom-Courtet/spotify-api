import { ApolloServer } from '@apollo/server'; // preserve-line

 import { startStandaloneServer } from '@apollo/server/standalone'; // preserve-line

 import { PrismaClient } from '@prisma/client';

 const prisma = new PrismaClient();
 
import { authorById } from './prisma/dataLoader/authorById.js';

 import { bookById } from './prisma/dataLoader/bookById.js';

 import { categoryById } from './prisma/dataLoader/categoryById.js';

 import { booksByAuthorIdLoader } from './prisma/dataLoader/booksByAuthorId.js';

 import { booksByCategoryIdLoader } from './prisma/dataLoader/booksByCategoryId.js';
 
// A schema is a collection of type definitions (hence "typeDefs")

 // that together define the "shape" of queries that are executed against

 // your data.

 const typeDefs = `#graphql

   # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
 
  # This "Book" type defines the queryable fields for every book in our data source.

   type Book {

     id: Int!,

     title: String

     author: Author!,

     category: Category!

   }
 
  type Author {

     id:Int!,

     name:String,

     books:[Book!]

   }
 
  type Category{

     id:Int!,

     name:String,

     books: [Book]

   }
 
  # The "Query" type is special: it lists all of the available queries that

   # clients can execute, along with the return type for each. In this

   # case, the "books" query returns an array of zero or more Books (defined above).

   type Query {

     books: [Book],

     authors : [Author],

     bookById(id: Int!): Book,

     categories: [Category]

   }
 
 
input CreateBookInput{

     title:String!,

     authorId:Int!,

     categoryId:Int!

 }
 
type Mutation {

     createBook(input: CreateBookInput): Book!

 }

 `

   // Resolvers define how to fetch the types defined in your schema.

 // This resolver retrieves books from the "books" array above.

 const resolvers = {

     Query: {

       books: () => prisma.book.findMany(),

       authors : () => prisma.author.findMany(),

       bookById: (_, { id }) => /* prisma.book.findUnique({ where: { id } }), */ bookById.load(id),

       categories : () => prisma.category.findMany()

     },

     Mutation:{

         createBook: async (_, { input }) => {

             const newBook = { ...input };

             await prisma.book.create({ data: newBook });

             return newBook;

         },

     },

     Book:{

         author: ({ authorId }) => /* prisma.author.findUnique({ where: { id: authorId } }), */ authorById.load(authorId),

         category: ({ categoryId }) => /* prisma.category.findUnique({ where: { id: categoryId } }) */ categoryById.load(categoryId),

     },

     Author:{

         books: ({ id }) => /* prisma.book.findMany({ where: { authorId: id } }) */ booksByAuthorIdLoader.load(id),

     },

     Category:{

         books: ({ id }) => /* prisma.book.findMany({ where: { categoryId: id } }) */ booksByCategoryIdLoader.load(id),

     }

   };
 
  // The ApolloServer constructor requires two parameters: your schema

 // definition and your set of resolvers.

 const server = new ApolloServer({

     typeDefs,

     resolvers,

   });

   // Passing an ApolloServer instance to the `startStandaloneServer` function:

   //  1. creates an Express app

   //  2. installs your ApolloServer instance as middleware

   //  3. prepares your app to handle incoming requests

   const { url } = await startStandaloneServer(server, {

     listen: { port: 4000 },

   });

   console.log(`🚀  Server ready at: ${url}`);