import { randomBytes, pbkdf2Sync } from "crypto";
import { UsersModel } from "./database/schemas";

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
        }
    }
};

export default resolvers