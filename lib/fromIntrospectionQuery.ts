import { isIntrospectionObjectType, filterDefinitionsTypes } from './typeGuards';
import { JSONSchema6 } from 'json-schema';
import { partition, includes, reduce } from 'lodash';
import { IntrospectionType, IntrospectionQuery } from 'graphql';
import { JSONSchema6Acc, introspectionTypeReducer } from './reducer';

export interface FromIntrospectionQueryOptions {
    ignoreInternals?: boolean;
}
export const fromIntrospectionQuery = (
    introspection: IntrospectionQuery,
    opts?: FromIntrospectionQueryOptions
): JSONSchema6 => {
    const options = opts || { ignoreInternals: true };
    const { queryType, mutationType } = introspection.__schema;
    const propertiesTypes = [queryType ? queryType.name : 'Query', mutationType ? mutationType.name : 'Mutation'];
    // Query and Mutation are properties, others are definitions
    const [properties, definitions] = partition(
        introspection.__schema.types,
        type => isIntrospectionObjectType(type) && includes(propertiesTypes, type.name)
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
