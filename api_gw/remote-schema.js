const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const { makeRemoteExecutableSchema, introspectSchema } = require('graphql-tools');


async function createRemoteSchema({ port, name }) {
    const uri = `http://localhost:${port}/graphql`;
    console.log(`stitching schema for ${name} from ${uri}`);

    const link = new HttpLink({ uri, fetch });
    const schema = await introspectSchema(link);

    const executableSchema = makeRemoteExecutableSchema({
        schema,
        link,
    });

    return executableSchema;
};

module.exports = createRemoteSchema;