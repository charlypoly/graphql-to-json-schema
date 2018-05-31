import {
    GraphQLNamedType,
    IntrospectionInputType,
    IntrospectionInputTypeRef,
    IntrospectionNamedTypeRef,
    IntrospectionOutputType,
    IntrospectionOutputTypeRef,
    IntrospectionTypeRef,
    KindEnum
} from 'graphql';
import { _Kind } from 'graphql/language/kinds';
import {
    JSONSchema6,
    JSONSchema6Type,
    JSONSchema6TypeName
} from 'json-schema';
import { includes } from 'lodash';
import { isIntrospectionListTypeRef, isNonNullIntrospectionType } from './typeGuards';

export type GraphQLTypeNames = 'String' | 'Int' | 'Float' | 'Boolean';

export const typesMapping: { [k in GraphQLTypeNames]: JSONSchema6TypeName } = {
    'Boolean': 'boolean',
    'String': 'string',
    'Int': 'number',
    'Float': 'number'
};

export type GraphqlToJSONTypeArg = IntrospectionTypeRef | IntrospectionInputTypeRef | IntrospectionOutputTypeRef;
export const graphqlToJSONType = (k: GraphqlToJSONTypeArg): JSONSchema6 => {
    if (isIntrospectionListTypeRef(k)) {
        return {
            type: 'array',
            items: graphqlToJSONType(k.ofType)
        };
    } else if (isNonNullIntrospectionType(k)) {
        return graphqlToJSONType(k.ofType);
    } else {
        const name = (k as IntrospectionNamedTypeRef<IntrospectionInputType | IntrospectionOutputType>).name;
        return includes(['OBJECT', 'INPUT_OBJECT'], k.kind) ?
            { $ref: `#/definitions/${name}` } :
            // tslint:disable-next-line:no-any
            { type: (typesMapping as any)[name] };
    }
};
