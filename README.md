# GraphQL Schema to JSON Schema [![npm version](https://badge.fury.io/js/graphql-2-json-schema.svg)](https://badge.fury.io/js/graphql-2-json-schema)

`graphql-2-json-schema` package

-----------

Transform a GraphQL Schema introspection file to a valid JSON Schema.

## Usage

```ts
import {
    graphqlSync,
    introspectionQuery,
    IntrospectionQuery
} from 'graphql';
import { fromIntrospectionQuery } from 'graphql-2-json-schema';

// schema is your GraphQL schema.

const introspection = graphqlSync(schema, introspectionQuery).data as IntrospectionQuery;

const result = fromIntrospectionQuery(introspection);
```

## Example


### Input

```graphql
type Todo {
    id: String!
    name: String!
    completed: Boolean
    color: Color
}

input TodoInputType {
    name: String!
    completed: Boolean
    color: Color
}

enum Color {
  "Red color"
  RED
  "Green color"
  GREEN
}

type Query {
    todo(id: String!): Todo
    todos: [Todo]
}

type Mutation {
    update_todo(id: String!, todo: TodoInputType!): Todo
    create_todo(todo: TodoInputType!): Todo
}
```

### Output

```js
{
    $schema: 'http://json-schema.org/draft-06/schema#',
    properties: {
        Query: {
            type: 'object',
            properties: {
                todo: {
                    type: 'object',
                    properties: {
                        arguments: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' }
                            },
                            required: ['id']
                        },
                        return: {
                            $ref: '#/definitions/Todo'
                        }
                    },
                    required: []
                },
                todos: {
                    type: 'object',
                    properties: {
                        arguments: {
                            type: 'object',
                            properties: {},
                            required: []
                        },
                        return: {
                            type: 'array',
                            items: { $ref: '#/definitions/Todo' }
                        }
                    },
                    required: []
                }
            },
            required: []
        },
        Mutation: {
            type: 'object',
            properties: {
                update_todo: {
                    type: 'object',
                    properties: {
                        arguments: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                todo: { $ref: '#/definitions/TodoInputType' }
                            },
                            required: ['id', 'todo']
                        },
                        return: {
                            $ref: '#/definitions/Todo'
                        }
                    },
                    required: []
                },
                create_todo: {
                    type: 'object',
                    properties: {
                        arguments: {
                            type: 'object',
                            properties: {
                                todo: { $ref: '#/definitions/TodoInputType' }
                            },
                            required: ['todo']
                        },
                        return: {
                            $ref: '#/definitions/Todo'
                        }
                    },
                    required: []
                }
            }
        },
    },
    definitions: {
        'Todo': {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                completed: { type: 'boolean' },
                color: { $ref: '#/definitions/Color' },
            },
            required: ['id', 'name']
        },
        'Color': {
            type: 'string',
            anyOf: [
                {
                    enum: ['RED'],
                    title: 'Red color',
                },
                {
                    enum: ['GREEN'],
                    title: 'Green color',
                }
            ]
        },
        'TodoInputType': {
            type: 'object',
            properties: {
                name: { type: 'string' },
                completed: { type: 'boolean' },
                color: { $ref: '#/definitions/Color' },
            },
            required: ['name']
        }
    }
}
```
