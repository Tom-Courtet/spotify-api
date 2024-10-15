import { ApolloServer } from "@apollo/server"; // preserve-line
import { startStandaloneServer } from "@apollo/server/standalone"; // preserve-line
import { PrismaClient } from '@prisma/client';

 const prisma = new PrismaClient();

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Song {
    id: Int!,
    name: String!,
    authors: [User!],
    album: Album,
    playlists: [Playlist]
  }

  type Album {
    id: Int!,
    name: String!,
    authors: [User!],
    songs: [Song!]
  }

  type Playlist {
    id: Int!,
    name: String!,
    authors: [User!],
    songs: [Song!]
  }

  type User {
    id: Int!,
    email: String!,
    name: String!,
    playlists: [Playlist!],
    songs: [Song!],
    albums: [Album!],
    artist: Boolean

  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    users: [User],
    songs: [Song],
    albums: [Album],
    playlists: [Playlist],
    userById(id: Int!): User,
    songById(id: Int!): Song,
    albumById(id: Int!): Album,
    playlistById(id: Int!): Playlist,
  }

  input CreateSongInput {
    name: String!,
    authorIds: [Int!],
    albumId: Int,
    playlistIds: [Int]
  }

  input CreateAlbumInput {
    name: String!,
    authorIds: [Int!],
    songIds: [Int!]
  }

  input CreatePlaylistInput {
    name: String!,
    authorIds: [Int!],
    songIds: [Int!]
  }

  input CreateUserInput {
    email: String!,
    name: String!,
    playlistIds: [Int!],
    songIds: [Int!],
    albumIds: [Int!],
    artist: Boolean
  }

  type Mutation {
    createSong(input: CreateSongInput!): Song
    createAlbum(input: CreateAlbumInput!): Album
    createPlaylist(input: CreatePlaylistInput!): Playlist
    createUser(input: CreateUserInput!): User
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        users: () => prisma.user.findMany(),
        songs: () => prisma.song.findMany(),
        albums: () => prisma.album.findMany(),

        playlists: () => prisma.playlist.findMany(),
        userById: (_, { id }) => userById.load(id),
        songById: (_, { id }) => songById.load(id),
        albumById: (_, { id }) => albumById.load(id),
        playlistById: (_, { id }) => playlistById.load(id),
    },
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
