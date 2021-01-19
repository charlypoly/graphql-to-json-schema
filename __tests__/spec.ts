import ajv from 'ajv'
import { JSONSchema6 } from 'json-schema'
import { fromIntrospectionQuery } from '../lib/fromIntrospectionQuery'
import {
  getTodoSchemaIntrospection,
  todoSchemaAsJsonSchema,
} from '../test-utils'

describe('GraphQL to JSON Schema', () => {
  const { introspection } = getTodoSchemaIntrospection()

  test('from IntrospectionQuery object', () => {
    const result = fromIntrospectionQuery(introspection)
    expect(result).toMatchObject(<JSONSchema6>todoSchemaAsJsonSchema)
    const validator = new ajv()
    validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
    expect(validator.validateSchema(result)).toBe(true)
  })
})
