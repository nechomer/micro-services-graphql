const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const gql = require('graphql-tag');
const { makeExecutableSchema } = require('graphql-tools');

const port = 4001;

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Company {
    employee: Employee
  }
  type Employee {
    name: String
  }
  type CompanyA {
    employeeA: EmployeeA
  }
  type EmployeeA {
    name: String
  }
  type Query {
    helloFromA: String
    company: Company
    companyWithError: Company
    companyAWithDeepError: CompanyA
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    helloFromA: () => 'Hello world!',
    company: () => ({ employee: { name: 'moti' } }),
    companyWithError: () => { throw new Error('regular error from depth 0');},
    companyAWithDeepError: () => ({}), //return empty object
  },
  CompanyA: {
    employeeA: (src) => { throw new Error('regular error from depth 1'); },
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
  console.log(`🚀 Service A is ready at http://localhost:${port}/graphql`),
);