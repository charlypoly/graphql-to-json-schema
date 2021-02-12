import {
  IntrospectionField,
  IntrospectionInputValue,
  IntrospectionScalarType,
  IntrospectionType,
} from 'graphql'
import { JSONSchema6 } from 'json-schema'
import { filter, map, MemoListIterator, reduce } from 'lodash'
import {
  isIntrospectionEnumType,
  isIntrospectionField,
  isIntrospectionInputObjectType,
  isIntrospectionInputValue,
  isIntrospectionListTypeRef,
  isIntrospectionObjectType,
  isNonNullIntrospectionType,
  isIntrospectionScalarType,
  isIntrospectionDefaultScalarType,
} from './typeGuards'
import { graphqlToJSONType, typesMapping } from './typesMapping'

export type JSONSchema6Acc = {
  [k: string]: JSONSchema6
}

type ReducerOptions = {
  nullableArrayItems?: boolean
}

type GetRequiredFieldsType = ReadonlyArray<
  IntrospectionInputValue | IntrospectionField
>
// Extract GraphQL no-nullable types
export const getRequiredFields = (fields: GetRequiredFieldsType) =>
  reduce(
    fields,
    (acc: string[], f) => {
      if (isNonNullIntrospectionType(f.type)) {
        acc.push(f.name)
      }
      return acc
    },
    []
  )

export type IntrospectionFieldReducerItem =
  | IntrospectionField
  | IntrospectionInputValue

// Wrapper for creating a reducer that allows for passing options
// to the reducer
export const introspectionFieldReducerGenerator: (
  options: ReducerOptions
) => MemoListIterator<
  IntrospectionFieldReducerItem,
  JSONSchema6Acc,
  ReadonlyArray<IntrospectionFieldReducerItem>
> = (options) => {
  // reducer for a types and inputs
  const introspectionFieldReducer: MemoListIterator<
    IntrospectionFieldReducerItem,
    JSONSchema6Acc,
    ReadonlyArray<IntrospectionFieldReducerItem>
  > = (acc, curr: IntrospectionFieldReducerItem): JSONSchema6Acc => {
    if (isIntrospectionField(curr)) {
      const returnType = isNonNullIntrospectionType(curr.type)
        ? graphqlToJSONType(curr.type.ofType, options)
        : graphqlToJSONType(curr.type, options)

      acc[curr.name] = {
        type: 'object',
        properties: {
          return: returnType,
          arguments: {
            type: 'object',
            properties: reduce<IntrospectionFieldReducerItem, JSONSchema6Acc>(
              curr.args as IntrospectionFieldReducerItem[],
              introspectionFieldReducer,
              {}
            ),
            required: getRequiredFields(curr.args),
          },
        },
        required: [],
      }
    } else if (isIntrospectionInputValue(curr)) {
      const returnType = isNonNullIntrospectionType(curr.type)
        ? graphqlToJSONType(curr.type.ofType, options)
        : graphqlToJSONType(curr.type, options)

      if (curr.defaultValue) {
        returnType.default = resolveDefaultValue(curr)
      }
      acc[curr.name] = returnType
    }

    acc[curr.name].description = curr.description || undefined
    return acc
  }

  return introspectionFieldReducer
}

// ENUM type defaults will not JSON.parse correctly, so if it is an ENUM then don't
// try to do that.
// TODO: fix typing here
export const resolveDefaultValue = (curr: any) => {
  return isIntrospectionEnumType(curr.type)
    ? curr.defaultValue
    : JSON.parse(curr.defaultValue)
}

// Reducer for each type exposed by the GraphQL Schema
export const introspectionTypeReducer: (
  type: 'definitions' | 'properties',
  options: ReducerOptions
) => MemoListIterator<
  IntrospectionType,
  JSONSchema6Acc,
  IntrospectionType[]
> = (type, options) => (acc, curr: IntrospectionType): JSONSchema6Acc => {
  const isQueriesOrMutations = type === 'properties'

  if (isIntrospectionObjectType(curr)) {
    acc[curr.name] = {
      type: 'object',
      properties: reduce<IntrospectionFieldReducerItem, JSONSchema6Acc>(
        curr.fields as IntrospectionFieldReducerItem[],
        introspectionFieldReducerGenerator(options),
        {}
      ),
      // Query and Mutation are special Types, whose fields represent the individual
      // queries and mutations. None of them ought to not be considered required, even if
      // their return value is a NON_NULL one.
      required: isQueriesOrMutations ? [] : getRequiredFields(curr.fields),
    }
  } else if (isIntrospectionInputObjectType(curr)) {
    acc[curr.name] = {
      type: 'object',
      properties: reduce<IntrospectionFieldReducerItem, JSONSchema6Acc>(
        curr.inputFields as IntrospectionFieldReducerItem[],
        introspectionFieldReducerGenerator(options),
        {}
      ),
      required: getRequiredFields(curr.inputFields),
    }
  } else if (isIntrospectionEnumType(curr)) {
    acc[curr.name] = {
      type: 'string',
      anyOf: curr.enumValues.map((item) => {
        return {
          enum: [item.name],
          title: item.description || item.name,
          description: item.description || undefined,
        }
      }),
    }
  } else if (isIntrospectionDefaultScalarType(curr)) {
    acc[curr.name] = {
      type: (typesMapping as any)[curr.name],
      title: curr.name,
    }
  } else if (isIntrospectionScalarType(curr)) {
    acc[(curr as IntrospectionScalarType).name] = {
      type: 'object',
      title: (curr as IntrospectionScalarType).name,
    }
  }

  acc[curr.name].description = curr.description || undefined
  return acc
}
