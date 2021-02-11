import {
  IntrospectionInputType,
  IntrospectionInputTypeRef,
  IntrospectionNamedTypeRef,
  IntrospectionOutputType,
  IntrospectionOutputTypeRef,
  IntrospectionTypeRef,
} from 'graphql'
import { JSONSchema6, JSONSchema6TypeName } from 'json-schema'
import { includes } from 'lodash'
import {
  isIntrospectionListTypeRef,
  isNonNullIntrospectionType,
} from './typeGuards'

export type GraphQLTypeNames = 'String' | 'Int' | 'Float' | 'Boolean'

export const typesMapping: { [k in GraphQLTypeNames]: JSONSchema6TypeName } = {
  Boolean: 'boolean',
  String: 'string',
  Int: 'number',
  Float: 'number',
}

// Convert a GraphQL Type to a valid JSON Schema type
export type GraphqlToJSONTypeArg =
  | IntrospectionTypeRef
  | IntrospectionInputTypeRef
  | IntrospectionOutputTypeRef

export type GraphqlToJSONTypeOptions = {
  isArray?: boolean
  isNonNull?: boolean
}

export const graphqlToJSONType = (k: GraphqlToJSONTypeArg, options: GraphqlToJSONTypeOptions = {}): JSONSchema6 => {
  if (isIntrospectionListTypeRef(k)) {
    return {
      type: 'array',
      items: graphqlToJSONType(k.ofType, { ...options, isArray: true }),
    }
  } else if (isNonNullIntrospectionType(k)) {
    return graphqlToJSONType(k.ofType, { ...options, isNonNull: true })
  } else {
    const name = (k as IntrospectionNamedTypeRef<
      IntrospectionInputType | IntrospectionOutputType
    >).name

    const {
      isArray,
      isNonNull,
    } = options

    const jsonType = {} as JSONSchema6

    if (includes(['OBJECT', 'INPUT_OBJECT', 'ENUM', 'SCALAR'], k.kind)) {
      jsonType.$ref = `#/definitions/${name}`
      // https://tools.ietf.org/html/draft-wright-json-schema-01#section-8
      // All other properties in a "$ref" object MUST be ignored.
      // if (includes(['SCALAR'], k.kind)) {
      //   jsonType.type = (typesMapping as any)[name]
      // }
    } else {
      jsonType.type = (typesMapping as any)[name]
    }

    if (isArray && !isNonNull) {
      return {
        anyOf: [
          jsonType,
          { type: 'null' }
        ]
      }
    }

    return jsonType
  }
}
