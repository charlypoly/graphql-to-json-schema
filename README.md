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
  nullableArrayItems: true,
  // Indicates how to define the `ID` scalar as part of a JSON Schema. Valid options
  // are `string`, `number`, or `both`. Defaults to `string`
  idTypeMapping: 'string'
}

// schema is your GraphQL schema.
const introspection = graphqlSync(schema, getIntrospectionQuery()).data as IntrospectionQuery;

const jsonSchema = fromIntrospectionQuery(introspection, options);
```

## Example

### Input

```graphql
  type Todo {
      id: ID!
      name: String!
      completed: Boolean
      color: Color

      "A field that requires an argument"
      colors(
        filter: [Color!]!
      ): [Color!]!
  }

  type SimpleTodo {
    id: ID!
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
        id: ID!,
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
        id: ID!,
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
                id: { '$ref': '#/definitions/ID' },
                isCompleted: {
                  description: 'A default value of false',
                  '$ref': '#/definitions/Boolean',
                  default: false
                }
              },
              required: [ 'id' ]
            }
          },
          required: []
        },
        todos: {
          description: 'Returns a list (or null) that can contain null values',
          type: 'object',
          properties: {
            return: {
              type: 'array',
              items: {
                anyOf: [ { '$ref': '#/definitions/Todo' }, { type: 'null' } ]
              }
            },
            arguments: {
              type: 'object',
              properties: {
                ids: {
                  description: 'Required argument that is a list that cannot contain null values',
                  type: 'array',
                  items: { '$ref': '#/definitions/String' }
                }
              },
              required: [ 'ids' ]
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
                id: { '$ref': '#/definitions/ID' },
                data: { '$ref': '#/definitions/TodoInputType' }
              },
              required: [ 'id', 'data' ]
            }
          },
          required: []
        },
        update_todos: {
          description: 'Returns a list (or null) that can contain null values',
          type: 'object',
          properties: {
            return: {
              type: 'array',
              items: {
                anyOf: [ { '$ref': '#/definitions/Todo' }, { type: 'null' } ]
              }
            },
            arguments: {
              type: 'object',
              properties: {
                ids: {
                  type: 'array',
                  items: { '$ref': '#/definitions/String' }
                },
                data: { '$ref': '#/definitions/TodoInputType' }
              },
              required: [ 'ids', 'data' ]
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
            return: { '$ref': '#/definitions/ID' },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        },
        name: {
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/String' },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        },
        completed: {
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/Boolean' },
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
    ID: {
      description: 'The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.',
      type: 'string',
      title: 'ID'
    },
    SimpleTodo: {
      type: 'object',
      properties: {
        id: {
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/ID' },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        },
        name: {
          type: 'object',
          properties: {
            return: { '$ref': '#/definitions/String' },
            arguments: { type: 'object', properties: {}, required: [] }
          },
          required: []
        }
      },
      required: [ 'id', 'name' ]
    },
    TodoUnion: {
      oneOf: [
        { '$ref': '#/definitions/Todo' },
        { '$ref': '#/definitions/SimpleTodo' }
      ]
    },
    TodoInputType: {
      type: 'object',
      properties: {
        name: { '$ref': '#/definitions/String' },
        completed: { '$ref': '#/definitions/Boolean' },
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
