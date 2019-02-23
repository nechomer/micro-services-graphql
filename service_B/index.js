const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const gql = require('graphql-tag');
const { makeExecutableSchema } = require('graphql-tools');
const { UserInputError } = require('apollo-server-errors');

const port = 4002;

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type CompanyB {
    employeeB: EmployeeB
  }
  type EmployeeB {
    name: String
  }
  type Query {
    helloFromB: String
    companyBWithApolloError: CompanyB
    companyBWithDeepApolloError: CompanyB
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    helloFromB: () => 'Hello world!',
    companyBWithApolloError: () => { throw new UserInputError('apollo error from depth 0', { name: "invalid name" });},
    companyBWithDeepApolloError: () => ({}), //return empty object
  },
  CompanyB: {
    employeeB: (src) => { throw new UserInputError('apollo error from depth 1', { name: "invalid name" });},
  }
};

const myGraphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const app = express();
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema }));
app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' })); // if you want GraphiQL enabled


app.listen({ port }, () =>
  console.log(`🚀 Service B is ready at http://localhost:${port}/graphql`),
);