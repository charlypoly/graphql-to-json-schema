import { types } from 'functional-json-schema';
import { IntrospectionField, IntrospectionInputValue, IntrospectionType } from 'graphql';
import { _Kind } from 'graphql/language/kinds';
import { JSONSchema6 } from 'json-schema';
import { filter, map, MemoListIterator, reduce } from 'lodash';
import {
    isIntrospectionField,
    isIntrospectionInputObjectType,
    isIntrospectionInputValue,
    isIntrospectionListTypeRef,
    isIntrospectionObjectType,
    isNonNullIntrospectionType
} from './typeGuards';
import { graphqlToJSONType, typesMapping } from './typesMapping';

export type JSONSchema6Acc = {
    [k: string]: boolean | JSONSchema6;
};

type GetRequiredFieldsType = ReadonlyArray<IntrospectionInputValue | IntrospectionField>;
export const getRequiredFields = (fields: GetRequiredFieldsType) => map(
    filter(
        fields,
        f => isNonNullIntrospectionType(f.type) && !isIntrospectionListTypeRef(f.type.ofType)
    ),
    f => f.name
);

export type IntrospectionFieldReducerItem = IntrospectionField | IntrospectionInputValue;

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
        }
        return acc;
    };

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
        }
        return acc;
    };

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
        }
        return acc;
    };
