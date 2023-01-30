import { IntrospectionQuery, IntrospectionType } from 'graphql'
import { JSONSchema6 } from 'json-schema'
import { includes, partition, reduce } from 'lodash'
import { introspectionTypeReducer, JSONSchema6Acc } from './reducer'
import { filterDefinitionsTypes, isIntrospectionObjectType } from './typeGuards'

import type {
  IDTypeMapping as IDTypeMappingType,
} from './types'

// FIXME: finish this type
export interface GraphQLJSONSchema6 extends JSONSchema6 {
  properties: {
    Query: JSONSchema6Acc
    Mutation: JSONSchema6Acc
  }
  definitions: JSONSchema6Acc
}

export interface FromIntrospectionQueryOptions {
  ignoreInternals?: boolean
  nullableArrayItems?: boolean
  IDTypeMapping?: IDTypeMappingType,
}

export const fromIntrospectionQuery = (
  introspection: IntrospectionQuery,
  opts?: FromIntrospectionQueryOptions
): JSONSchema6 => {
  const options = {
    // Defaults
    ignoreInternals: true,
    nullableArrayItems: false,
    // User-specified
    ...(opts || {}),
  }
  const { queryType, mutationType } = introspection.__schema

  if (mutationType) {
    const rootMutationType = (introspection.__schema.types as any).find(
      (t: any) => t.name == mutationType.name
    )
    if (rootMutationType) {
      ;(introspection.__schema.types as any).Mutation = rootMutationType
      ;(introspection.__schema.types as any).Mutation.name = 'Mutation'
    }
  }

  if (queryType) {
    const rootQueryType = (introspection.__schema.types as any).find(
      (t: any) => t.name == queryType.name
    )
    if (rootQueryType) {
      ;(introspection.__schema.types as any).Query = rootQueryType
      ;(introspection.__schema.types as any).Query.name = 'Query'
    }
  }
  //////////////////////////////////////////////////////////////////////
  //// Query and Mutation are properties, custom Types are definitions
  //////////////////////////////////////////////////////////////////////
  const [properties, definitions] = partition(
    introspection.__schema.types,
    (type) =>
      isIntrospectionObjectType(type) &&
      includes(['Query', 'Mutation'], type.name)
  )

  return {
    $schema: 'http://json-schema.org/draft-06/schema#',
    properties: reduce<IntrospectionType, JSONSchema6Acc>(
      properties,
      introspectionTypeReducer('properties', options),
      {}
    ),
    definitions: reduce<IntrospectionType, JSONSchema6Acc>(
      filterDefinitionsTypes(definitions, options),
      introspectionTypeReducer('definitions', options),
      {}
    ),
  }
}
