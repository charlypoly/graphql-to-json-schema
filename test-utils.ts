import {
    buildSchema,
    GraphQLSchema,
    graphqlSync,
    introspectionQuery,
    IntrospectionQuery
} from 'graphql';
import { JSONSchema6 } from 'json-schema';

type GetTodoSchemaIntrospectionResult = {
    schema: GraphQLSchema;
    introspection: IntrospectionQuery;
};
export const getTodoSchemaIntrospection = (): GetTodoSchemaIntrospectionResult => {
    const schema = buildSchema(`
        "Anything with an ID can be a node"
        interface Node {
            "A unique identifier"
            id: String!
        }

        "A custom scalar"
        scalar DateTime

        "A ToDo Object"
        type Todo implements Node {
            "A unique identifier"
            id: String!
            name: String!
            completed: Boolean
            color: Color
            addedAt: DateTime
        }

        "Example union"
        union TodoAndMore = Todo

        """
        A type that describes ToDoInputType. Its description might not
        fit within the bounds of 80 width and so you want MULTILINE
        """
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
            todo(
                "todo identifier"
                id: String!
            ): Todo!
            todos: [Todo!]!
        }

        type Mutation {
            update_todo(id: String!, todo: TodoInputType!): Todo
            create_todo(todo: TodoInputType!): Todo
        }
`);

    const result = graphqlSync(schema, introspectionQuery);
    return {
        introspection: (result.data as IntrospectionQuery),
        schema
    };
};

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
                                id: { type: 'string', description: "todo identifier", $ref: '#/definitions/String' }
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
                                id: { type: 'string', $ref: '#/definitions/String' },
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
            },
            required: []
        },
    },
    definitions: {
        'Boolean': {
            type: 'boolean',
            title: 'Boolean',
            description: 'The `Boolean` scalar type represents `true` or `false`.'
        },
        'String': {
            type: 'string',
            title: 'String',
            description: 'The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.'
        },
        'DateTime': {
            type: 'object',
            title: 'DateTime',
            description: 'A custom scalar'
        },
        'Node': {
            type: 'object',
            description: 'Anything with an ID can be a node',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier',
                    $ref: '#/definitions/String'
                }
            },
            required: ['id']
        },
        'Todo': {
            type: 'object',
            description: "A ToDo Object",
            properties: {
                id: { type: 'string', description: 'A unique identifier', $ref: '#/definitions/String' },
                name: { type: 'string', $ref: '#/definitions/String' },
                completed: { type: 'boolean', $ref: '#/definitions/Boolean' },
                color: { $ref: '#/definitions/Color' },
                addedAt: { $ref: '#/definitions/DateTime' }
            },
            required: ['id', 'name']
        },
        'Color': {
            type: 'string',
            anyOf: [
                {
                    enum: ['RED'],
                    title: 'Red color',
                    description: 'Red color'
                },
                {
                    enum: ['GREEN'],
                    title: 'Green color',
                    description: 'Green color'
                }
            ]
        },
        'TodoAndMore': {
            type: 'object',
            description: 'Example union',
            anyOf: [
                { $ref: '#/definitions/Todo' }
            ]
        },
        'TodoInputType': {
            type: 'object',
            description: 'A type that describes ToDoInputType. Its description might not\nfit within the bounds of 80 width and so you want MULTILINE',
            properties: {
                name: { type: 'string', $ref: '#/definitions/String' },
                completed: { type: 'boolean', $ref: '#/definitions/Boolean' },
                color: { $ref: '#/definitions/Color' },
            },
            required: ['name']
        }
    }
};
