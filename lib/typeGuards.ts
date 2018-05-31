import {
    IntrospectionEnumType,
    IntrospectionField,
    IntrospectionInputObjectType,
    IntrospectionInputTypeRef,
    IntrospectionInputValue,
    IntrospectionListTypeRef,
    IntrospectionNamedTypeRef,
    IntrospectionNonNullTypeRef,
    IntrospectionObjectType,
    IntrospectionOutputTypeRef,
    IntrospectionSchema,
    IntrospectionType,
    IntrospectionTypeRef
} from 'graphql';
import { filter, has, startsWith } from 'lodash';

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

export const isNonNullIntrospectionType =
    (type: IntrospectionTypeRef): type is IntrospectionNonNullTypeRef<IntrospectionNamedTypeRef<IntrospectionType>> => (
        type.kind === 'NON_NULL'
    );

export interface FilterDefinitionsTypesOptions { ignoreInternals?: boolean; }
export const filterDefinitionsTypes =
    (types: IntrospectionType[], opts?: FilterDefinitionsTypesOptions): IntrospectionType[] => {
        const ignoreInternals = opts && opts.ignoreInternals;
        return filter(
            types,
            type => (
                (isIntrospectionObjectType(type) && !!type.fields) ||
                (isIntrospectionInputObjectType(type) && !!type.inputFields)
            ) &&
                (!ignoreInternals || (ignoreInternals && !startsWith(type.name, '__')))
        );
    };
