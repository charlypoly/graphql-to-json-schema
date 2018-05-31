import { JSONSchema6 } from "json-schema";
import { MemoListIterator, reduce, filter, map } from "lodash";
import { IntrospectionType, IntrospectionField, IntrospectionInputValue } from "graphql";
import {
    isIntrospectionObjectType,
    isNonNullIntrospectionType,
    isIntrospectionInputObjectType,
    isIntrospectionInputValue,
    isIntrospectionField
} from './typeGuards';
import { types } from 'functional-json-schema';
import { typesMapping, graphqlToJSONType } from './typesMapping';
import { _Kind } from "graphql/language/kinds";

export type JSONSchema6Acc = {
    [k: string]: boolean | JSONSchema6;
};

type GetRequiredFieldsType = ReadonlyArray<IntrospectionInputValue | IntrospectionField>;
export const getRequiredFields = (fields: GetRequiredFieldsType) => map(
    filter(
        fields,
        f => isNonNullIntrospectionType(f.type)
    ),
    f => f.name
);

export type IntrospectionFieldReducerItem = IntrospectionField | IntrospectionInputValue;

export const propertiesIntrospectionFieldReducer: MemoListIterator<IntrospectionFieldReducerItem, JSONSchema6Acc, ReadonlyArray<IntrospectionFieldReducerItem>> =
    (acc, curr: IntrospectionFieldReducerItem, i, k): JSONSchema6Acc => {

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
                        properties: reduce(curr.args, propertiesIntrospectionFieldReducer, {}),
                        required: getRequiredFields(curr.args)
                    },
                },
                required: []
            }
        } else if (isIntrospectionInputValue(curr)) {
            const returnType = isNonNullIntrospectionType(curr.type) ?
                graphqlToJSONType(curr.type.ofType) :
                graphqlToJSONType(curr.type);
            acc[curr.name] = returnType;
        }
        return acc;
    };

export const definitionsIntrospectionFieldReducer: MemoListIterator<IntrospectionFieldReducerItem, JSONSchema6Acc, ReadonlyArray<IntrospectionFieldReducerItem>> =
    (acc, curr: IntrospectionFieldReducerItem, i, k): JSONSchema6Acc => {

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


export const introspectionTypeReducer: (type: 'definitions' | 'properties') => MemoListIterator<IntrospectionType, JSONSchema6Acc, IntrospectionType[]> =
    (type) => (acc, curr: IntrospectionType): JSONSchema6Acc => {
        const fieldReducer = type === 'definitions' ?
            definitionsIntrospectionFieldReducer :
            propertiesIntrospectionFieldReducer;

        if (isIntrospectionObjectType(curr)) {
            acc[curr.name] = {
                type: 'object',
                properties: reduce(curr.fields, fieldReducer, {}),
                required: getRequiredFields(curr.fields)
            }
        } else if (isIntrospectionInputObjectType(curr)) {
            acc[curr.name] = {
                type: 'object',
                properties: reduce(curr.inputFields, fieldReducer, {}),
                required: getRequiredFields(curr.inputFields)
            }
        }
        return acc;
    }