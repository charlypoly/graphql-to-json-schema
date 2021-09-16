# GraphQL Schema to JSON Schema [![npm version](https://badge.fury.io/js/graphql-2-json-schema.svg)](https://badge.fury.io/js/graphql-2-json-schema)

`graphql-2-json-schema` package

-----------

Transform a GraphQL Schema introspection file to a valid JSON Schema.

## Usage

```ts
import {
    graphqlSync,
    getIntrospectionQuery,
    IntrospectionQuery
} from 'graphql';

import { fromIntrospectionQuery } from 'graphql-2-json-schema';

const options = {
  // Whether or not to ignore GraphQL internals that are probably not relevant
  // to documentation generation.
  // Defaults to `true`
  ignoreInternals: true,
  // Whether or not to properly represent GraphQL Lists with Nullable elements
  // as type "array" with items being an "anyOf" that includes the possible
  // type and a "null" type.
  // Defaults to `false` for backwards compatibility, but in future versions
  // the effect of `true` is likely going to be the default and only way. It is
  // highly recommended that new implementations set this value to `true`.
  nullableArrayItems: true
}

// schema is your GraphQL schema.
const introspection = graphqlSync(schema, getIntrospectionQuery()).data as IntrospectionQuery;

const jsonSchema = fromIntrospectionQuery(introspection, options);
```

## Example

### Input

```graphql
  type Todo {
      id: String!
      name: String!
      completed: Boolean
      color: Color

      "A field that requires an argument"
      colors(
        filter: [Color!]!
      ): [Color!]!
  }

  type SimpleTodo {
    id: String!
    name: String!
  }

  union TodoUnion = Todo | SimpleTodo

  input TodoInputType {
      name: String!
      completed: Boolean
      color: Color=RED
  }

  enum Color {
      "Red color"
      RED
      "Green color"
      GREEN
  }

  type Query {
      "A Query with 1 required argument and 1 optional argument"
      todo(
        id: String!,
        "A default value of false"
        isCompleted: Boolean=false
      ): Todo

      "Returns a list (or null) that can contain null values"
      todos(
        "Required argument that is a list that cannot contain null values"
        ids: [String!]!
      ): [Todo]
  }

  type Mutation {
      "A Mutation with 1 required argument"
      create_todo(
        todo: TodoInputType!
      ): Todo!

      "A Mutation with 2 required arguments"
      update_todo(
        id: String!,
        data: TodoInputType!
      ): Todo!

      "Returns a list (or null) that can contain null values"
      update_todos(
        ids: [String!]!
        data: TodoInputType!
      ): [Todo]
  }
```

### Output

```js
// Output is from call to fromIntrospectionQuery with the following options:
const options = { nullableArrayItems: true }

{ '$schema': 'http://json-schema.org/draft-06/schema#',
  properties:
   { Query:
      { type: 'object',
        properties:
         { todo:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/Todo' },
                 arguments:
                  { type: 'object',
                    properties:
                     { id: { '$ref': '#/definitions/String' },
                       isCompleted:
                        { '$ref': '#/definitions/Boolean',
                          default: false,
                          description: 'A default value of false' } },
                    required: [ 'id' ] } },
              required: [],
              description: 'A Query with 1 required argument and 1 optional argument' },
           todos:
            { type: 'object',
              properties:
               { return:
                  { type: 'array',
                    items:
                     { anyOf: [ { '$ref': '#/definitions/Todo' }, { type: 'null' } ] } },
                 arguments:
                  { type: 'object',
                    properties:
                     { ids:
                        { type: 'array',
                          items: { '$ref': '#/definitions/String' },
                          description: 'Required argument that is a list that cannot contain null values' } },
                    required: [ 'ids' ] } },
              required: [],
              description: 'Returns a list (or null) that can contain null values' } },
        required: [] },
     Mutation:
      { type: 'object',
        properties:
         { create_todo:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/Todo' },
                 arguments:
                  { type: 'object',
                    properties: { todo: { '$ref': '#/definitions/TodoInputType' } },
                    required: [ 'todo' ] } },
              required: [],
              description: 'A Mutation with 1 required argument' },
           update_todo:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/Todo' },
                 arguments:
                  { type: 'object',
                    properties:
                     { id: { '$ref': '#/definitions/String' },
                       data: { '$ref': '#/definitions/TodoInputType' } },
                    required: [ 'id', 'data' ] } },
              required: [],
              description: 'A Mutation with 2 required arguments' },
           update_todos:
            { type: 'object',
              properties:
               { return:
                  { type: 'array',
                    items:
                     { anyOf: [ { '$ref': '#/definitions/Todo' }, { type: 'null' } ] } },
                 arguments:
                  { type: 'object',
                    properties:
                     { ids: { type: 'array', items: { '$ref': '#/definitions/String' } },
                       data: { '$ref': '#/definitions/TodoInputType' } },
                    required: [ 'ids', 'data' ] } },
              required: [],
              description: 'Returns a list (or null) that can contain null values' } },
        required: [] } },
  definitions:
   { Todo:
      { type: 'object',
        properties:
         { id:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/String' },
                 arguments: { type: 'object', properties: {}, required: [] } },
              required: [] },
           name:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/String' },
                 arguments: { type: 'object', properties: {}, required: [] } },
              required: [] },
           completed:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/Boolean' },
                 arguments: { type: 'object', properties: {}, required: [] } },
              required: [] },
           color:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/Color' },
                 arguments: { type: 'object', properties: {}, required: [] } },
              required: [] },
           colors:
            { type: 'object',
              properties:
               { return: { type: 'array', items: { '$ref': '#/definitions/Color' } },
                 arguments:
                  { type: 'object',
                    properties:
                     { filter: { type: 'array', items: { '$ref': '#/definitions/Color' } } },
                    required: [ 'filter' ] } },
              required: [],
              description: 'A field that requires an argument' } },
        required: [ 'id', 'name', 'colors' ] },
     String:
      { type: 'string',
        title: 'String',
        description: 'The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.' },
     Boolean:
      { type: 'boolean',
        title: 'Boolean',
        description: 'The `Boolean` scalar type represents `true` or `false`.' },
     SimpleTodo:
      { type: 'object',
        properties:
         { id:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/String' },
                 arguments: { type: 'object', properties: {}, required: [] } },
              required: [] },
           name:
            { type: 'object',
              properties:
               { return: { '$ref': '#/definitions/String' },
                 arguments: { type: 'object', properties: {}, required: [] } },
              required: [] } },
        required: [ 'id', 'name' ] },
     TodoUnion:
      { oneOf:
         [ { '$ref': '#/definitions/Todo' },
           { '$ref': '#/definitions/SimpleTodo' } ] },
     TodoInputType:
      { type: 'object',
        properties:
         { name: { '$ref': '#/definitions/String' },
           completed: { '$ref': '#/definitions/Boolean' },
           color: { '$ref': '#/definitions/Color', default: 'RED' } },
        required: [ 'name' ] },
     Color:
      { type: 'string',
        anyOf:
         [ { enum: [ 'RED' ], title: 'Red color', description: 'Red color' },
           { enum: [ 'GREEN' ],
             title: 'Green color',
             description: 'Green color' } ] } } }
```
