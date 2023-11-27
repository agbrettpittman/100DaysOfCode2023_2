import { randomBytes, pbkdf2Sync } from "crypto";
import { UsersModel } from "./database/schemas.js";
import { GraphQLError } from "graphql";
import jwt from 'jsonwebtoken';

const resolvers = {
    Query: {
        users: async () => {
            return await UsersModel.find();
        }
    },

    Mutation: {
        createUser: async (obj:{}, { input }) => {
            const Salt = randomBytes(128).toString('base64');
            const Hash = pbkdf2Sync(input.password, Salt, 10000, 512, 'sha512').toString('hex');
            input.salt = Salt;
            input.password = Hash;
            const user = new UsersModel(input);
            await user.save();
            return user;
        },
        loginUser: async (obj:{}, { input }) => {
            const { userName, password } = input;
            const InvalidLoginError = new GraphQLError('Invalid login', {
                extensions: {
                    code: 'INVALID_LOGIN',
                    http: { status: 401 }
                }
            });
            const UserFound = await UsersModel.findOne({ userName });
            if (!UserFound) throw InvalidLoginError;
            const { salt, password: hash } = UserFound;
            const Hash = pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
            if (hash !== Hash) throw InvalidLoginError;
            const token = jwt.sign({ userId: UserFound._id }, process.env.JWT_SECRET);
            return { token, user: UserFound };
        }
    }
};

export default resolvers