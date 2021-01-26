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
      "A field that requires an argument"
      colors(filter: [Color!]!): [Color!]!
  }

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
      todo(id: String!, isCompleted: Boolean=false): Todo
      todos: [Todo]
  }

  type Mutation {
      "A Mutation with 1 required argument"
      create_todo(todo: TodoInputType!): Todo
      "A Mutation with 2 required arguments"
      update_todo(id: String!, todo: TodoInputType!): Todo
  }
```

### Output

```js
{
  '$schema': 'http://json-schema.org/draft-06/schema#',
  properties: {
    Query: {
      type: 'object',
      properties: {
        todo: {
          description: 'A Query with 1 required argument and 1 optional argument',
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/Todo' },
            arguments: {
              type: 'object',
              properties: {
                id: { '$ref': '#/definitions/String', type: 'string' },
                isCompleted: {
                  '$ref': '#/definitions/Boolean',
                  type: 'boolean',
                  default: false
                }
              },
              required: [ 'id' ]
            }
          },
          required: []
        },
        todos: {
          type: 'object',
          properties: {
            return: { type: 'array', items: { '$ref': '#/definitions/Todo' } },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        }
      },
      required: []
    },
    Mutation: {
      type: 'object',
      properties: {
        create_todo: {
          description: 'A Mutation with 1 required argument',
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/Todo' },
            arguments: {
              type: 'object',
              properties: { todo: { '$ref': '#/definitions/TodoInputType' } },
              required: [ 'todo' ]
            }
          },
          required: []
        },
        update_todo: {
          description: 'A Mutation with 2 required arguments',
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/Todo' },
            arguments: {
              type: 'object',
              properties: {
                id: { '$ref': '#/definitions/String', type: 'string' },
                todo: { '$ref': '#/definitions/TodoInputType' }
              },
              required: [ 'id', 'todo' ]
            }
          },
          required: []
        }
      },
      required: []
    }
  },
  definitions: {
    Todo: {
      type: 'object',
      properties: {
        id: {
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/String', type: 'string' },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        },
        name: {
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/String', type: 'string' },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        },
        completed: {
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/Boolean', type: 'boolean' },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        },
        color: {
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/Color' },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        },
        colors: {
          description: 'A field that requires an argument',
          type: 'object',
          properties: {
            return: { type: 'array', items: { '$ref': '#/definitions/Color' } },
            arguments: {
              type: 'object',
              properties: {
                filter: {
                  type: 'array',
                  items: { '$ref': '#/definitions/Color' }
                }
              },
              required: [ 'filter' ]
            }
          },
          required: []
        }
      },
      required: [ 'id', 'name', 'colors' ]
    },
    TodoInputType: {
      type: 'object',
      properties: {
        name: { '$ref': '#/definitions/String', type: 'string' },
        completed: { '$ref': '#/definitions/Boolean', type: 'boolean' },
        color: { '$ref': '#/definitions/Color', default: 'RED' }
      },
      required: [ 'name' ]
    },
    Color: {
      type: 'string',
      anyOf: [
        {
          description: 'Red color',
          enum: [ 'RED' ],
          title: 'Red color'
        },
        {
          description: 'Green color',
          enum: [ 'GREEN' ],
          title: 'Green color'
        }
      ]
    },
    String: {
      description: 'The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.',
      type: 'string',
      title: 'String'
    },
    Boolean: {
      description: 'The `Boolean` scalar type represents `true` or `false`.',
      type: 'boolean',
      title: 'Boolean'
    }
  }
}
```
