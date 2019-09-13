import {
    IntrospectionEnumType,
    IntrospectionField,
    IntrospectionInputObjectType,
    IntrospectionInputTypeRef,
    IntrospectionInputValue,
    IntrospectionInterfaceType,
    IntrospectionListTypeRef,
    IntrospectionNamedTypeRef,
    IntrospectionNonNullTypeRef,
    IntrospectionObjectType,
    IntrospectionOutputTypeRef,
    IntrospectionScalarType,
    IntrospectionSchema,
    IntrospectionType,
    IntrospectionTypeRef,
    IntrospectionUnionType
} from 'graphql';
import { filter, has, startsWith, includes } from 'lodash';
import { typesMapping } from "./typesMapping";

///////////////////
/// Type guards ///
///////////////////

export const isIntrospectionField = (type: IntrospectionField | IntrospectionInputValue): type is IntrospectionField =>
    has(type, 'args');

export const isIntrospectionInputValue =
    (type: IntrospectionField | IntrospectionInputValue): type is IntrospectionInputValue =>
        has(type, 'defaultValue');

// @ts-ignore
export const isIntrospectionListTypeRef =
    (type: IntrospectionTypeRef | IntrospectionInputTypeRef | IntrospectionOutputTypeRef):
        type is IntrospectionListTypeRef => (
            type.kind === 'LIST'
        );

export const isIntrospectionObjectType = (type: IntrospectionSchema['types'][0]): type is IntrospectionObjectType => (
    type.kind === 'OBJECT'
);

export const isIntrospectionInputObjectType =
    (type: IntrospectionSchema['types'][0]): type is IntrospectionInputObjectType => (
        type.kind === 'INPUT_OBJECT'
    );

export const isIntrospectionEnumType = (type: IntrospectionSchema['types'][0]): type is IntrospectionEnumType => (
    type.kind === 'ENUM'
);

export const isIntrospectionScalarType = (type: IntrospectionSchema['types'][0]): type is IntrospectionScalarType => (
    type.kind === 'SCALAR'
);

export const isIntrospectionUnionType = (type: IntrospectionSchema['types'][0]): type is IntrospectionUnionType => (
    type.kind === 'UNION'
);

export const isIntrospectionInterfaceType = (type: IntrospectionSchema['types'][0]): type is IntrospectionInterfaceType => (
    type.kind === 'INTERFACE'
);

export const isNonNullIntrospectionType =
    (type: IntrospectionTypeRef): type is IntrospectionNonNullTypeRef<IntrospectionNamedTypeRef<IntrospectionType>> => (
        type.kind === 'NON_NULL'
    );

export const isIntrospectionDefaultScalarType = (type: IntrospectionSchema['types'][0]): type is IntrospectionScalarType => (
        type.kind === 'SCALAR' && includes(['Boolean', 'String', 'Int', 'Float'], type.name)
    );

// Ignore all GraphQL native Scalars, directives, etc...
export interface FilterDefinitionsTypesOptions { ignoreInternals?: boolean; }
export const filterDefinitionsTypes =
    (types: IntrospectionType[], opts?: FilterDefinitionsTypesOptions): IntrospectionType[] => {
        const ignoreInternals = opts && opts.ignoreInternals;
        return filter(
            types,
            type => (
                (isIntrospectionObjectType(type) && !!type.fields) ||
                (isIntrospectionInputObjectType(type) && !!type.inputFields) ||
                (isIntrospectionEnumType(type) && !!type.enumValues) ||
                (isIntrospectionScalarType(type) && !! type.name) ||
                isIntrospectionInterfaceType(type) ||
                isIntrospectionUnionType(type)
            ) &&
                (!ignoreInternals || (ignoreInternals && !startsWith(type.name, '__')))
        );
    };
