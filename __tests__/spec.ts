import ajv from 'ajv'
import { JSONSchema6 } from 'json-schema'
import { fromIntrospectionQuery } from '../lib/fromIntrospectionQuery'
import type { IDTypeMapping as IDTypeMappingType } from '../lib/types'
import {
  getTodoSchemaIntrospection,
  todoSchemaAsJsonSchema,
  todoSchemaAsJsonSchemaWithoutNullableArrayItems,
  todoSchemaAsJsonSchemaWithIdTypeNumber,
  todoSchemaAsJsonSchemaWithIdTypeStringOrNumber,
} from '../test-utils'

describe('GraphQL to JSON Schema', () => {
  const { introspection } = getTodoSchemaIntrospection()

  test('from IntrospectionQuery object', () => {
    const result = fromIntrospectionQuery(introspection)
    expect(result).toEqual(
      <JSONSchema6>todoSchemaAsJsonSchemaWithoutNullableArrayItems
    )
    const validator = new ajv()
    validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
    expect(validator.validateSchema(result)).toBe(true)
  })

  test('from IntrospectionQuery object with nullableArrayItems = true', () => {
    const options = {
      nullableArrayItems: true,
    }
    const result = fromIntrospectionQuery(introspection, options)
    expect(result).toEqual(<JSONSchema6>todoSchemaAsJsonSchema)
    const validator = new ajv()
    validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
    expect(validator.validateSchema(result)).toBe(true)
  })

  test('from IntrospectionQuery object with idTypeMapping = "number"', () => {
    const options = {
      nullableArrayItems: true,
      idTypeMapping: 'number' as IDTypeMappingType,
    }
    const result = fromIntrospectionQuery(introspection, options)
    expect(result).toEqual(<JSONSchema6>todoSchemaAsJsonSchemaWithIdTypeNumber)
    const validator = new ajv()
    validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
    expect(validator.validateSchema(result)).toBe(true)
  })

  test('from IntrospectionQuery object with idTypeMapping = "both"', () => {
    const options = {
      nullableArrayItems: true,
      idTypeMapping: 'both' as IDTypeMappingType,
    }
    const result = fromIntrospectionQuery(introspection, options)
    expect(result).toEqual(
      <JSONSchema6>todoSchemaAsJsonSchemaWithIdTypeStringOrNumber
    )
    const validator = new ajv()
    validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
    expect(validator.validateSchema(result)).toBe(true)
  })
})
