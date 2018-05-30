# GraphQL Schema to JSON Schema


### Input

```graphql
type Todo {
    id: String!
    name: String!
    completed: Boolean
}

input TodoInputType {
    name: String!
    completed: Boolean
}

type Query {
    todo(id: String!): Todo
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
                            }
                        },
                        return: {
                            $ref: '#/definitions/Todo'
                        }
                    },
                    required: ['id']
                }
            }
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
                    }
                },
                create_todo: {
                    type: 'object',
                    properties: {
                        arguments: {
                            type: 'object',
                            properties: {
                                todo: { $ref: '#/definitions/TodoInputType' }
                            },
                            required: ['id', 'todo']
                        },
                        return: {
                            $ref: '#/definitions/Todo'
                        }
                    },
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
            },
            required: ['name', 'id', 'completed']
        }
    }
}
```