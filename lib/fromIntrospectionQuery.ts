import { JSONSchema6 } from "json-schema";
import { IntrospectionQuery, IntrospectionSchema, IntrospectionObjectType, IntrospectionType, IntrospectionInputObjectType } from "graphql";
import { partition, includes, filter, startsWith, reduce, MemoListIterator, MemoObjectIterator } from "lodash";
import { isNull } from "util";

const isIntrospectionObjectType = (type: IntrospectionSchema['types'][0]): type is IntrospectionObjectType => (
    type.kind === 'OBJECT'
);

const isIntrospectionInputObjectType = (type: IntrospectionSchema['types'][0]): type is IntrospectionInputObjectType => (
    type.kind === 'INPUT_OBJECT'
);

interface FilterDefinitionsTypesOptions { ignoreInternals?: boolean; }
const filterDefinitionsTypes = (types: IntrospectionType[], opts?: FilterDefinitionsTypesOptions): IntrospectionType[] => {
    const ignoreInternals = opts && opts.ignoreInternals;
    return filter(
        types,
        type => (
            (isIntrospectionObjectType(type) && !!type.fields) ||
            (isIntrospectionInputObjectType(type) && !!type.inputFields)
        ) &&
            (!ignoreInternals || (ignoreInternals && !startsWith(type.name, '__')))
    );
}

type JSONSchema6Acc = {
    [k: string]: boolean | JSONSchema6;
};

const introspectionTypeReducer: MemoListIterator<IntrospectionType, JSONSchema6Acc, IntrospectionType[]> =
    (acc, curr: IntrospectionType): JSONSchema6Acc => {
        acc[curr.name] = isIntrospectionObjectType(curr) ?
            { properties: {} } :
            {};
        return acc;
    }

export interface FromIntrospectionQueryOptions {
    ignoreInternals?: boolean;
}
export const fromIntrospectionQuery = (
    introspection: IntrospectionQuery,
    opts?: FromIntrospectionQueryOptions
): JSONSchema6 => {
    const options = opts || { ignoreInternals: true };
    const { queryType, mutationType } = introspection.__schema;
    const propertiesTypes = [queryType.name, mutationType.name];
    // Query and Mutation are properties, others are definitions
    const [properties, definitions] = partition(
        introspection.__schema.types,
        type => isIntrospectionObjectType(type) && includes(propertiesTypes, type.name)
    );
    return {
        $schema: 'http://json-schema.org/draft-06/schema#',
        properties: reduce<IntrospectionType, JSONSchema6Acc>(
            properties, introspectionTypeReducer, {}
        ),
        definitions: reduce<IntrospectionType, JSONSchema6Acc>(
            filterDefinitionsTypes(definitions, options), introspectionTypeReducer, {}
        )
    };
}
