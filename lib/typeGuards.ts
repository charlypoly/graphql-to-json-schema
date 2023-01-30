import {
  IntrospectionEnumType,
  IntrospectionField,
  IntrospectionInputObjectType,
  IntrospectionInterfaceType,
  IntrospectionInputTypeRef,
  IntrospectionInputValue,
  IntrospectionListTypeRef,
  IntrospectionNamedTypeRef,
  IntrospectionNonNullTypeRef,
  IntrospectionObjectType,
  IntrospectionOutputTypeRef,
  IntrospectionSchema,
  IntrospectionType,
  IntrospectionTypeRef,
  IntrospectionUnionType,
  IntrospectionScalarType,
  TypeKind,
} from 'graphql'
import { filter, has, startsWith, includes } from 'lodash'

export const SUPPORTED_SCALARS = Object.freeze([
  'Boolean',
  'String',
  'Int',
  'Float',
  'ID',
])

export const SUPPORTED_KINDS = Object.freeze([
  TypeKind.SCALAR,
  TypeKind.OBJECT,
  TypeKind.INPUT_OBJECT,
  TypeKind.INTERFACE,
  TypeKind.ENUM,
  TypeKind.UNION,
])

///////////////////
/// Type guards ///
///////////////////

export const isIntrospectionField = (
  type: IntrospectionField | IntrospectionInputValue
): type is IntrospectionField => has(type, 'args')

export const isIntrospectionInputValue = (
  type: IntrospectionField | IntrospectionInputValue
): type is IntrospectionInputValue => has(type, 'defaultValue')

// @ts-ignore
export const isIntrospectionListTypeRef = (
  type:
    | IntrospectionTypeRef
    | IntrospectionInputTypeRef
    | IntrospectionOutputTypeRef
): type is IntrospectionListTypeRef => type.kind === TypeKind.LIST

export const isNonNullIntrospectionType = (
  type: IntrospectionTypeRef
): type is IntrospectionNonNullTypeRef<
  IntrospectionNamedTypeRef<IntrospectionType>
> => type.kind === TypeKind.NON_NULL

export const isIntrospectionScalarType = (
  type: IntrospectionSchema['types'][0]
): type is IntrospectionScalarType => type.kind === TypeKind.SCALAR

export const isIntrospectionObjectType = (
  type: IntrospectionSchema['types'][0]
): type is IntrospectionObjectType => type.kind === TypeKind.OBJECT

export const isIntrospectionInputObjectType = (
  type: IntrospectionSchema['types'][0]
): type is IntrospectionInputObjectType => type.kind === TypeKind.INPUT_OBJECT

export const isIntrospectionInterfaceType = (
  type: IntrospectionSchema['types'][0]
): type is IntrospectionInterfaceType => type.kind === TypeKind.INTERFACE

export const isIntrospectionEnumType = (
  type: IntrospectionSchema['types'][0]
): type is IntrospectionEnumType => type.kind === TypeKind.ENUM

export const isIntrospectionUnionType = (
  type: IntrospectionSchema['types'][0]
): type is IntrospectionUnionType => type.kind === TypeKind.UNION

export const isIntrospectionDefaultScalarType = (
  type: IntrospectionSchema['types'][0]
): type is IntrospectionScalarType =>
  type.kind === TypeKind.SCALAR && includes(SUPPORTED_SCALARS, type.name)

// Ignore all GraphQL native Scalars, directives, etc...
export interface FilterDefinitionsTypesOptions {
  ignoreInternals?: boolean
}
export const filterDefinitionsTypes = (
  types: IntrospectionType[],
  opts?: FilterDefinitionsTypesOptions
): IntrospectionType[] => {
  const ignoreInternals = opts && opts.ignoreInternals
  return filter(
    types,
    (type) =>
      ((isIntrospectionScalarType(type) && !!type.name) ||
        (isIntrospectionObjectType(type) && !!type.fields) ||
        (isIntrospectionInputObjectType(type) && !!type.inputFields) ||
        (isIntrospectionInterfaceType(type) && !!type.fields) ||
        (isIntrospectionEnumType(type) && !!type.enumValues) ||
        (isIntrospectionUnionType(type) && !!type.possibleTypes)) &&
      (!ignoreInternals || (ignoreInternals && !startsWith(type.name, '__')))
  )
}
