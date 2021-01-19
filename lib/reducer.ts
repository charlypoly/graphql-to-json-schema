import { IntrospectionField, IntrospectionInputValue, IntrospectionScalarType, IntrospectionType } from 'graphql';
import { JSONSchema6 } from 'json-schema';
import { filter, map, MemoListIterator, reduce } from 'lodash';
import {
    isIntrospectionEnumType,
    isIntrospectionField,
    isIntrospectionInputObjectType,
    isIntrospectionInputValue,
    isIntrospectionListTypeRef,
    isIntrospectionObjectType,
    isNonNullIntrospectionType,
    isIntrospectionScalarType,
    isIntrospectionDefaultScalarType
} from './typeGuards';
import { graphqlToJSONType, typesMapping } from './typesMapping';

export type JSONSchema6Acc = {
    [k: string]: JSONSchema6;
};


type GetRequiredFieldsType = ReadonlyArray<IntrospectionInputValue | IntrospectionField>;
// Extract GraphQL no-nullable types
export const getRequiredFields = (fields: GetRequiredFieldsType) => map(
    filter(
        fields,
        f => {
            // Not 100% sure if the GraphQL spec requires that NON_NULL should be
            // the parent of LIST if it's both a NON_NULL and LIST field, but this
            // should handle either case/implementation
            return isIntrospectionListTypeRef(f.type) ?
                isNonNullIntrospectionType(f.type.ofType) :
                isNonNullIntrospectionType(f.type);
        }
    ),
    f => f.name
);

export type IntrospectionFieldReducerItem = IntrospectionField | IntrospectionInputValue;

// reducer for a queries/mutations
export const propertiesIntrospectionFieldReducer:
    MemoListIterator<IntrospectionFieldReducerItem, JSONSchema6Acc, ReadonlyArray<IntrospectionFieldReducerItem>> =
    (acc, curr: IntrospectionFieldReducerItem): JSONSchema6Acc => {
        if (isIntrospectionField(curr)) {
            const returnType = isNonNullIntrospectionType(curr.type) ?
                graphqlToJSONType(curr.type.ofType) :
                graphqlToJSONType(curr.type);

            acc[curr.name] = {
                type: 'object',
                properties: {
                    'return': returnType,
                    'arguments': {
                        type: 'object',
                        properties: reduce<IntrospectionFieldReducerItem, JSONSchema6Acc>(
                            curr.args as IntrospectionFieldReducerItem[], propertiesIntrospectionFieldReducer, {}
                        ),
                        required: getRequiredFields(curr.args)
                    },
                },
                required: []
            };
        } else if (isIntrospectionInputValue(curr)) {
            const returnType = isNonNullIntrospectionType(curr.type) ?
                graphqlToJSONType(curr.type.ofType) :
                graphqlToJSONType(curr.type);

            acc[curr.name] = returnType;
            if (curr.defaultValue) {
                acc[curr.name].default = resolveDefaultValue(curr)
            }
        }

        acc[curr.name].description = curr.description || undefined;
        return acc;
    };

// reducer for a custom types
export const definitionsIntrospectionFieldReducer:
    MemoListIterator<IntrospectionFieldReducerItem, JSONSchema6Acc, ReadonlyArray<IntrospectionFieldReducerItem>> =
    (acc, curr: IntrospectionFieldReducerItem): JSONSchema6Acc => {
        if (isIntrospectionField(curr)) {
            const returnType = isNonNullIntrospectionType(curr.type) ?
                graphqlToJSONType(curr.type.ofType) :
                graphqlToJSONType(curr.type);

            acc[curr.name] = returnType;
        } else if (isIntrospectionInputValue(curr)) {
            const returnType = isNonNullIntrospectionType(curr.type) ?
                graphqlToJSONType(curr.type.ofType) :
                graphqlToJSONType(curr.type);

            acc[curr.name] = returnType;
            if (curr.defaultValue) {
                acc[curr.name].default = resolveDefaultValue(curr)
            }
        }

        acc[curr.name].description = curr.description || undefined;
        return acc;
    };

// ENUM type defaults will not JSON.parse correctly, so if it is an ENUM then don't
// try to do that.
// TODO: fix typing here
export const resolveDefaultValue = (curr: any) => {
    return isIntrospectionEnumType(curr.type) ?
        curr.defaultValue :
        JSON.parse(curr.defaultValue);
}

// Reducer for each type exposed by the GraphQL Schema
export const introspectionTypeReducer:
    (type: 'definitions' | 'properties') => MemoListIterator<IntrospectionType, JSONSchema6Acc, IntrospectionType[]> =
    type => (acc, curr: IntrospectionType): JSONSchema6Acc => {
        const fieldReducer = type === 'definitions' ?
            definitionsIntrospectionFieldReducer :
            propertiesIntrospectionFieldReducer;

        if (isIntrospectionObjectType(curr)) {
            acc[curr.name] = {
                type: 'object',
                properties: reduce<IntrospectionFieldReducerItem, JSONSchema6Acc>(
                    curr.fields as IntrospectionFieldReducerItem[], fieldReducer, {}
                ),
                // ignore required for Mutations/Queries
                required: type === 'definitions' ? getRequiredFields(curr.fields) : []
            };
        } else if (isIntrospectionInputObjectType(curr)) {
            acc[curr.name] = {
                type: 'object',
                properties: reduce<IntrospectionFieldReducerItem, JSONSchema6Acc>(
                    curr.inputFields as IntrospectionFieldReducerItem[], fieldReducer, {}
                ),
                required: getRequiredFields(curr.inputFields)
            };
        } else if (isIntrospectionEnumType(curr)) {
            acc[curr.name] = {
                type: 'string',
                anyOf: curr.enumValues.map((item) => {
                    return {
                        enum: [
                            item.name,
                        ],
                        title: item.description || item.name,
                        description: item.description || undefined
                    };
                }),
            };
        } else if(isIntrospectionDefaultScalarType(curr)){
            acc[curr.name] = {
                type: (typesMapping as any)[curr.name],
                title: curr.name
            }
        }
        else if (isIntrospectionScalarType(curr)){
            acc[(curr as IntrospectionScalarType).name] = {
                type: 'object',
                title: (curr as IntrospectionScalarType).name
            };
        }

        acc[curr.name].description = curr.description || undefined;
        return acc;
    };
