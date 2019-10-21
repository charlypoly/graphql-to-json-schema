import { IntrospectionQuery, IntrospectionType } from 'graphql';
import { JSONSchema6 } from 'json-schema';
import { includes, partition, reduce } from 'lodash';
import { introspectionTypeReducer, JSONSchema6Acc } from './reducer';
import { filterDefinitionsTypes, isIntrospectionObjectType } from './typeGuards';

// FIXME: finish this type
export interface GraphQLJSONSchema6 extends JSONSchema6 {
    properties: {
        Query: JSONSchema6Acc;
        Mutation: JSONSchema6Acc;
    };
    definitions: JSONSchema6Acc;
}

export interface FromIntrospectionQueryOptions {
    ignoreInternals?: boolean; // true by default
}
export const fromIntrospectionQuery = (
    introspection: IntrospectionQuery,
    opts?: FromIntrospectionQueryOptions
): JSONSchema6 => {
    const options = opts || { ignoreInternals: true };
    const { queryType, mutationType } = introspection.__schema;

    (introspection.__schema.types as any).Mutation =  (introspection.__schema.types as any)[mutationType ? mutationType.name : 'Mutation'];
    (introspection.__schema.types as any).Query = (introspection.__schema.types as any)[queryType ? queryType.name : 'Query'];
    //////////////////////////////////////////////////////////////////////
    //// Query and Mutation are properties, custom Types are definitions
    //////////////////////////////////////////////////////////////////////
    const [properties, definitions] = partition(
        introspection.__schema.types,
        type => isIntrospectionObjectType(type) && includes(['Query', 'Mutation'], type.name)
    );

    return {
        $schema: 'http://json-schema.org/draft-06/schema#',
        properties: reduce<IntrospectionType, JSONSchema6Acc>(
            properties, introspectionTypeReducer('properties'), {}
        ),
        definitions: reduce<IntrospectionType, JSONSchema6Acc>(
            filterDefinitionsTypes(definitions, options), introspectionTypeReducer('definitions'), {}
        )
    };
};
