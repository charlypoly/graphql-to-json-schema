import {
  buildSchema,
  GraphQLSchema,
  graphqlSync,
  IntrospectionQuery,
  getIntrospectionQuery,
} from 'graphql'
import { JSONSchema6 } from 'json-schema'

type GetTodoSchemaIntrospectionResult = {
  schema: GraphQLSchema
  introspection: IntrospectionQuery
}
export const getTodoSchemaIntrospection = (): GetTodoSchemaIntrospectionResult => {
  const schema = buildSchema(`
        "A ToDo Object"
        type Todo {
            "A unique identifier"
            id: String!
            name: String!
            completed: Boolean
            color: Color
            "A required list containing colors that cannot contain nulls"
            requiredColors: [Color!]!
            "A non-required list containing colors that cannot contain nulls"
            optionalColors: [Color!]
            fieldWithOptionalArgument(
              optionalFilter: [String!]
            ): [String!]
            fieldWithRequiredArgument(
              requiredFilter: [String!]!
            ): [String!]
        }

        """
        A type that describes ToDoInputType. Its description might not
        fit within the bounds of 80 width and so you want MULTILINE
        """
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
            todo(
                "todo identifier"
                id: String!
                isCompleted: Boolean=false
                requiredStatuses: [String!]!
                optionalStatuses: [String!]
            ): Todo!
            todos: [Todo!]!
        }

        type Mutation {
            update_todo(id: String!, todo: TodoInputType!): Todo
            create_todo(todo: TodoInputType!): Todo
        }
`)

  const result = graphqlSync(schema, getIntrospectionQuery())

  return {
    introspection: result.data as IntrospectionQuery,
    schema,
  }
}

export const todoSchemaAsJsonSchema: JSONSchema6 = {
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
                id: { type: 'string', description: 'todo identifier' },
                isCompleted: { type: 'boolean', default: false },
                requiredStatuses: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                optionalStatuses: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
              required: ['id', 'requiredStatuses'],
            },
            return: {
              $ref: '#/definitions/Todo',
            },
          },
          required: [],
        },
        todos: {
          type: 'object',
          properties: {
            arguments: {
              type: 'object',
              properties: {},
              required: [],
            },
            return: {
              type: 'array',
              items: { $ref: '#/definitions/Todo' },
            },
          },
          required: [],
        },
      },
      // Inappropriate for individual queries to be required, despite possibly having
      // NON_NULL return types
      required: [],
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
                todo: { $ref: '#/definitions/TodoInputType' },
              },
              required: ['id', 'todo'],
            },
            return: {
              $ref: '#/definitions/Todo',
            },
          },
          required: [],
        },
        create_todo: {
          type: 'object',
          properties: {
            arguments: {
              type: 'object',
              properties: {
                todo: { $ref: '#/definitions/TodoInputType' },
              },
              required: ['todo'],
            },
            return: {
              $ref: '#/definitions/Todo',
            },
          },
          required: [],
        },
      },
      // Inappropriate for individual mutations to be required, despite possibly having
      // NON_NULL return types
      required: [],
    },
  },
  definitions: {
    Todo: {
      type: 'object',
      description: 'A ToDo Object',
      properties: {
        id: {
          description: 'A unique identifier',
          type: 'object',
          properties: {
            return: { type: 'string' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        name: {
          type: 'object',
          properties: {
            return: { type: 'string' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        completed: {
          type: 'object',
          properties: {
            return: { type: 'boolean' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        color: {
          type: 'object',
          properties: {
            return: { $ref: '#/definitions/Color' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        requiredColors: {
          description:
            'A required list containing colors that cannot contain nulls',
          type: 'object',
          properties: {
            return: {
              type: 'array',
              items: { $ref: '#/definitions/Color' },
            },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        optionalColors: {
          description:
            'A non-required list containing colors that cannot contain nulls',
          type: 'object',
          properties: {
            return: {
              type: 'array',
              items: { $ref: '#/definitions/Color' },
            },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        fieldWithOptionalArgument: {
          type: 'object',
          properties: {
            return: {
              type: 'array',
              items: { type: 'string' },
            },
            arguments: {
              type: 'object',
              properties: {
                optionalFilter: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: [],
            },
          },
          required: [],
        },
        fieldWithRequiredArgument: {
          type: 'object',
          properties: {
            return: {
              type: 'array',
              items: { type: 'string' },
            },
            arguments: {
              type: 'object',
              properties: {
                requiredFilter: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['requiredFilter'],
            },
          },
          required: [],
        },
      },
      required: ['id', 'name', 'requiredColors'],
    },
    Color: {
      type: 'string',
      anyOf: [
        {
          enum: ['RED'],
          title: 'Red color',
          description: 'Red color',
        },
        {
          enum: ['GREEN'],
          title: 'Green color',
          description: 'Green color',
        },
      ],
    },
    TodoInputType: {
      type: 'object',
      description:
        'A type that describes ToDoInputType. Its description might not\nfit within the bounds of 80 width and so you want MULTILINE',
      properties: {
        name: { type: 'string' },
        completed: { type: 'boolean' },
        color: { default: 'RED', $ref: '#/definitions/Color' },
      },
      required: ['name'],
    },
  },
}
