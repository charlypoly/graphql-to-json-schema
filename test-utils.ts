import {
  buildSchema,
  GraphQLSchema,
  graphqlSync,
  IntrospectionQuery,
  getIntrospectionQuery,
} from 'graphql'
import { JSONSchema6 } from 'json-schema'

import { isEqual, cloneDeepWith } from 'lodash'

type GetTodoSchemaIntrospectionResult = {
  schema: GraphQLSchema
  introspection: IntrospectionQuery
}
export const getTodoSchemaIntrospection = (): GetTodoSchemaIntrospectionResult => {
  const schema = buildSchema(`
        "A ToDo Object"
        type Todo implements Node {
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

            nullableFieldThatReturnsListOfNonNullStrings(
              nonRequiredArgumentOfNullableStrings: [String]
              nonRequiredArgumentOfNonNullableStrings: [String!]
              requiredArgumentOfNullableStrings: [String]!
              requiredArgumentOfNonNullableStrings: [String!]!
            ): [String!]

            nullableFieldThatReturnsListOfNullableStrings: [String]
        }

        "A simpler ToDo Object"
        type SimpleTodo {
          id: String!
          name: String!
        }

        "A Union of Todo and SimpleTodo"
        union TodoUnion = Todo | SimpleTodo

        enum Color {
          "Red color"
          RED
          "Green color"
          GREEN
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

        "Anything with an ID can be a node"
        interface Node {
            "A unique identifier"
            id: String!
        }

        type Query {
            todo(
                "todo identifier"
                id: String!
                isCompleted: Boolean=false
                requiredNonNullStrings: [String!]!
                optionalNonNullStrings: [String!]

                requiredNullableStrings: [String]!
                optionalNullableStringsWithDefault: [String]=["foo"]
            ): Todo!
            todos: [Todo!]!
            node(
              "Node identifier"
              id: String!
            ): Node
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
                id: {
                  $ref: '#/definitions/String',
                  description: 'todo identifier',
                },
                isCompleted: { $ref: '#/definitions/Boolean', default: false },
                requiredNonNullStrings: {
                  type: 'array',
                  items: { $ref: '#/definitions/String' },
                },
                optionalNonNullStrings: {
                  type: 'array',
                  items: {
                    $ref: '#/definitions/String',
                  },
                },
                requiredNullableStrings: {
                  type: 'array',
                  items: {
                    anyOf: [{ $ref: '#/definitions/String' }, { type: 'null' }],
                  },
                },
                optionalNullableStringsWithDefault: {
                  type: 'array',
                  items: {
                    anyOf: [{ $ref: '#/definitions/String' }, { type: 'null' }],
                  },
                  default: ['foo'],
                },
              },
              required: [
                'id',
                'requiredNonNullStrings',
                'requiredNullableStrings',
              ],
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
        node: {
          type: 'object',
          properties: {
            arguments: {
              type: 'object',
              properties: {
                id: {
                  description: 'Node identifier',
                  $ref: '#/definitions/String',
                },
              },
              required: ['id'],
            },
            return: {
              $ref: '#/definitions/Node',
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
                id: { $ref: '#/definitions/String' },
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
    Boolean: {
      type: 'boolean',
      title: 'Boolean',
      description: 'The `Boolean` scalar type represents `true` or `false`.',
    },
    String: {
      type: 'string',
      title: 'String',
      description:
        'The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.',
    },
    Todo: {
      type: 'object',
      description: 'A ToDo Object',
      properties: {
        id: {
          description: 'A unique identifier',
          type: 'object',
          properties: {
            return: { $ref: '#/definitions/String' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        name: {
          type: 'object',
          properties: {
            return: { $ref: '#/definitions/String' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        completed: {
          type: 'object',
          properties: {
            return: { $ref: '#/definitions/Boolean' },
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
              items: { $ref: '#/definitions/String' },
            },
            arguments: {
              type: 'object',
              properties: {
                optionalFilter: {
                  type: 'array',
                  items: { $ref: '#/definitions/String' },
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
              items: { $ref: '#/definitions/String' },
            },
            arguments: {
              type: 'object',
              properties: {
                requiredFilter: {
                  type: 'array',
                  items: { $ref: '#/definitions/String' },
                },
              },
              required: ['requiredFilter'],
            },
          },
          required: [],
        },
        nullableFieldThatReturnsListOfNonNullStrings: {
          type: 'object',
          properties: {
            return: {
              type: 'array',
              items: { $ref: '#/definitions/String' },
            },
            arguments: {
              type: 'object',
              properties: {
                nonRequiredArgumentOfNullableStrings: {
                  type: 'array',
                  items: {
                    anyOf: [{ $ref: '#/definitions/String' }, { type: 'null' }],
                  },
                },
                nonRequiredArgumentOfNonNullableStrings: {
                  type: 'array',
                  items: { $ref: '#/definitions/String' },
                },
                requiredArgumentOfNullableStrings: {
                  type: 'array',
                  items: {
                    anyOf: [{ $ref: '#/definitions/String' }, { type: 'null' }],
                  },
                },
                requiredArgumentOfNonNullableStrings: {
                  type: 'array',
                  items: { $ref: '#/definitions/String' },
                },
              },
              required: [
                'requiredArgumentOfNullableStrings',
                'requiredArgumentOfNonNullableStrings',
              ],
            },
          },
          required: [],
        },
        nullableFieldThatReturnsListOfNullableStrings: {
          type: 'object',
          properties: {
            return: {
              type: 'array',
              items: {
                anyOf: [{ $ref: '#/definitions/String' }, { type: 'null' }],
              },
            },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
      },
      required: ['id', 'name', 'requiredColors'],
    },
    SimpleTodo: {
      type: 'object',
      description: 'A simpler ToDo Object',
      properties: {
        id: {
          type: 'object',
          properties: {
            return: { $ref: '#/definitions/String' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
        name: {
          type: 'object',
          properties: {
            return: { $ref: '#/definitions/String' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
      },
      required: ['id', 'name'],
    },
    Color: {
      // Yes, ENUM types should be the JSON built-in "string" type
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
        name: { $ref: '#/definitions/String' },
        completed: { $ref: '#/definitions/Boolean' },
        color: { default: 'RED', $ref: '#/definitions/Color' },
      },
      required: ['name'],
    },
    TodoUnion: {
      description: 'A Union of Todo and SimpleTodo',
      oneOf: [
        { $ref: '#/definitions/Todo' },
        { $ref: '#/definitions/SimpleTodo' },
      ],
    },
    Node: {
      type: 'object',
      description: 'Anything with an ID can be a node',
      properties: {
        id: {
          type: 'object',
          description: 'A unique identifier',
          properties: {
            return: { $ref: '#/definitions/String' },
            arguments: { type: 'object', properties: {}, required: [] },
          },
          required: [],
        },
      },
      required: ['id'],
    },
  },
}

export const todoSchemaAsJsonSchemaWithoutNullableArrayItems: JSONSchema6 = cloneDeepWith(
  todoSchemaAsJsonSchema,
  (value, key, object, stack) => {
    // Convert the new way back to the old way
    if (
      key === 'items' &&
      isEqual(Object.keys(value), ['anyOf']) &&
      value.anyOf.length === 2 &&
      value.anyOf.find((e: any) => isEqual(e, { type: 'null' }))
    ) {
      return value.anyOf.find((e: any) => !isEqual(e, { type: 'null' }))
    }
  }
)
