import {
    GraphQLNamedType,
    KindEnum,
    IntrospectionOutputTypeRef,
    IntrospectionInputTypeRef,
    IntrospectionNamedTypeRef,
    IntrospectionInputType,
    IntrospectionOutputType,
    IntrospectionTypeRef
} from "graphql";
import {
    JSONSchema6TypeName,
    JSONSchema6Type,
    JSONSchema6
} from "json-schema";
import { _Kind } from "graphql/language/kinds";
import { isIntrospectionListTypeRef } from "./typeGuards";
import { includes } from "lodash";

export type GraphQLTypeNames = 'String' | 'Int' | 'Float' | 'Boolean';

export const typesMapping: { [k in GraphQLTypeNames]: JSONSchema6TypeName } = {
    'Boolean': 'boolean',
    'String': 'string',
    'Int': 'number',
    'Float': 'number'
}

export type GraphqlToJSONTypeArg = IntrospectionTypeRef | IntrospectionInputTypeRef | IntrospectionOutputTypeRef;
export const graphqlToJSONType = (k: GraphqlToJSONTypeArg): JSONSchema6 => {
    if (isIntrospectionListTypeRef(k)) {
        return {
            type: 'array',
            items: graphqlToJSONType(k.ofType)
        }
    } else {
        const name = (k as IntrospectionNamedTypeRef<IntrospectionInputType | IntrospectionOutputType>).name;
        return includes(['OBJECT', 'INPUT_OBJECT'], k.kind) ?
            { $ref: `#/definitions/${name}` } :
            { type: (typesMapping as any)[name] }
    }
}