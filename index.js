import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4"; // preserve-line
import { startStandaloneServer } from "@apollo/server/standalone"; // preserve-line
import { PrismaClient } from '@prisma/client';
import { playlistsByUserIdLoader } from './prisma/dataLoader/playlistsByUserIdLoader.js'
import { songById } from './prisma/dataLoader/songById.js'
import { songsByUserIdLoader } from './prisma/dataLoader/songsByUserIdLoader.js'
import express from 'express';
import cookieParser from "cookie-parser";

const prisma = new PrismaClient(); 
const typeDefs = `#graphql
  
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

const resolvers = {
    Query: {
        users: () => prisma.user.findMany(),
        songs: () => prisma.song.findMany(),
        albums: () => prisma.album.findMany(),

        playlists: () => prisma.playlist.findMany(),
        userById: (_, { id }, context) => userById.load(id),
        songById: (_, { id }) => songById.load(id),
        albumById: (_, { id }) => albumById.load(id),
        playlistById: (_, { id }) => playlistById.load(id),
    },

    Mutation: {
        createSong: async (_, { input }) => {
            const newSong = { ...input };
            await prisma.song.create({ data: newSong });
            return newSong;
        },
        createAlbum: async (_, { input }) => {
            const newAlbum = { ...input };
            await prisma.album.create({ data: newAlbum });
            return newAlbum;
        },
        createPlaylist: async (_, { input }) => {
            const newPlaylist = { ...input };
            await prisma.playlist.create({ data: newPlaylist });
            return newPlaylist;
        },
        createUser: async (_, { input }) => {
            const newUser = { ...input };
            return prisma.user.create({ data: newUser });
        },
    },

    User: {
        playlists: ({ playlistsId }) => playlistsByUserIdLoader.load(playlistsId), // many
        songs: ({ songsId }) => songsByUserIdLoader.load(songsId), // many
        albums: ({ albumsId }) => albumsByUserIdLoader.load(albumsId), // many
    },

    Song: {
        authors: ({ usersId }) => usersBySongIdLoader.load(usersId), // many
        playlists: ({ playlistsId }) =>
            playlistsBySongIdLoader.load(playlistsId), // many
    },

    Album: {
        authors: ({ usersId }) => usersByAlbumIdLoader.load(usersId), // many
        songs: ({ songsId }) => songsByAlbumIdLoader.load(songsId), // many
    },

    Playlist: {
        authors: ({ usersId }) => usersByPlaylistIdLoader.load(usersId), // many
        songs: ({ songsId }) => songsByPlaylistIdLoader.load(songsId), // many
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

await server.start();

const app = express();

app.use(cookieParser());
app.use(
    '/graphql',
    //cors<cors.CorseRequest>(),
    express.json(),
    expressMiddleware(server),
)


app.listen(4000, () => {
    console.log(`🚀  Server ready at http://localhost:4000/graphql `);
})


