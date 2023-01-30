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
  SUPPORTED_KINDS,
  isIntrospectionListTypeRef,
  isNonNullIntrospectionType,
} from './typeGuards'

import { GraphQLTypeNames, IDTypeMapping as IDTypeMappingType } from './types'

export const ID_TYPE_MAPPING_OPTION_DEFAULT = 'string' as IDTypeMappingType

const ID_TYPES: {
  [k in IDTypeMappingType]: JSONSchema6TypeName | JSONSchema6TypeName[]
} = {
  string: 'string',
  number: 'number',
  both: ['string', 'number'],
}

const SCALAR_TO_JSON: {
  [k in GraphQLTypeNames]: JSONSchema6TypeName | JSONSchema6TypeName[]
} = {
  Boolean: 'boolean',
  String: 'string',
  Int: 'number',
  Float: 'number',
  ID: ID_TYPES[ID_TYPE_MAPPING_OPTION_DEFAULT],
}

export const scalarToJsonType = (
  scalarName: GraphQLTypeNames,
  options: GraphqlToJSONTypeOptions = {}
): JSONSchema6TypeName | JSONSchema6TypeName[] =>
  Object.assign({}, SCALAR_TO_JSON, {
    ID: ID_TYPES[options.idTypeMapping || ID_TYPE_MAPPING_OPTION_DEFAULT],
  })[scalarName]

// Convert a GraphQL Type to a valid JSON Schema type
export type GraphqlToJSONTypeArg =
  | IntrospectionTypeRef
  | IntrospectionInputTypeRef
  | IntrospectionOutputTypeRef

export type GraphqlToJSONTypeOptions = {
  nullableArrayItems?: boolean
  isArray?: boolean
  isNonNull?: boolean
  idTypeMapping?: IDTypeMappingType
}

export const graphqlToJSONType = (
  k: GraphqlToJSONTypeArg,
  options: GraphqlToJSONTypeOptions = {}
): JSONSchema6 => {
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

    const { isArray, isNonNull, nullableArrayItems } = options

    const jsonType = {} as JSONSchema6

    if (includes(SUPPORTED_KINDS, k.kind)) {
      jsonType.$ref = `#/definitions/${name}`
    } else {
      jsonType.type = scalarToJsonType(name as GraphQLTypeNames, options)
    }

    // Only if the option allows for it, represent an array with nullable items
    // using the "anyOf"
    if (nullableArrayItems && isArray && !isNonNull) {
      return {
        anyOf: [jsonType, { type: 'null' }],
      }
    }

    return jsonType
  }
}
