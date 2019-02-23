const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const gql = require('graphql-tag');
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const createRemoteSchema = require('./remote-schema');
const { formatApolloErrors } = require('apollo-server-errors');

const port = 4000;

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const myGraphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const formatError = (error) => {
    console.log(`got error ${error.name}`)
    const flattenedErrors =[];
    if (Array.isArray(error.errors)) {
        error.errors.forEach(e => flattenedErrors.push(e));
    } else if (
        error.originalError &&
        Array.isArray(error.originalError.errors)
    ) {
        error.originalError.errors.forEach(e => flattenedErrors.push(e));
    } else {
        flattenedErrors.push(error);
    }

    return formatApolloErrors(flattenedErrors)[0];
    // return error;
};

const app = express();

app.listen({ port }, () =>
  console.log(`🚀 API GW Service is ready at http://localhost:${port}`),
);

(async () => {
    const serviceASchema = await createRemoteSchema({ port: 4001, name: 'service A' });
    const serviceBSchema = await createRemoteSchema({ port: 4002, name: 'service B' });
    const schema = mergeSchemas({
        schemas: [
            myGraphQLSchema,
            serviceASchema,
            serviceBSchema
        ],
    });

    app.use('/graphql', bodyParser.json(), graphqlExpress({
        schema,
        formatError
    }));
    app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
    console.log(`🚀 API GW Service Graphiql is ready at http://localhost:${port}/graphiql`);
})();
