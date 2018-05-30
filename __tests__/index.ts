import * as ajv from 'ajv';
import { getTodoSchemaIntrospection, todoSchemaAsJsonSchema } from '../test-utils';
import { fromIntrospectionQuery } from '../lib/fromIntrospectionQuery';
import { JSONSchema6 } from 'json-schema';

describe('GraphQL to JSON Schema', () => {

    const { introspection, schema } = getTodoSchemaIntrospection();

    test('from GraphQLSchema object', () => {

    });

    test('from IntrospectionQuery object', () => {
        const result = fromIntrospectionQuery(introspection);
        expect(result).toEqual(<JSONSchema6>todoSchemaAsJsonSchema);
        const validator = new ajv();
        validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
        expect(validator.validateSchema(result)).toBe(true);
    });
})