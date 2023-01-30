import { inspect } from 'util'
import { spawn } from 'child_process'
import { filter } from 'lodash'
import {
  buildSchema,
  graphqlSync,
  IntrospectionQuery,
  getIntrospectionQuery,
} from 'graphql'

import { fromIntrospectionQuery } from './lib/fromIntrospectionQuery'

const nativeScalarsToFilter = ['String', 'Int', 'Boolean']

const readmeSDL: string = `
  type Todo {
      id: ID!
      name: String!
      completed: Boolean
      color: Color

      "A field that requires an argument"
      colors(
        filter: [Color!]!
      ): [Color!]!
  }

  type SimpleTodo {
    id: ID!
    name: String!
  }

  union TodoUnion = Todo | SimpleTodo

  input TodoInputType {
      name: String!
      completed: Boolean
      color: Color=RED
  }

  enum Color {
      "Red color"
      RED
      "Green color"
      GREEN
  }

  type Query {
      "A Query with 1 required argument and 1 optional argument"
      todo(
        id: ID!,
        "A default value of false"
        isCompleted: Boolean=false
      ): Todo

      "Returns a list (or null) that can contain null values"
      todos(
        "Required argument that is a list that cannot contain null values"
        ids: [String!]!
      ): [Todo]
  }

  type Mutation {
      "A Mutation with 1 required argument"
      create_todo(
        todo: TodoInputType!
      ): Todo!

      "A Mutation with 2 required arguments"
      update_todo(
        id: ID!,
        data: TodoInputType!
      ): Todo!

      "Returns a list (or null) that can contain null values"
      update_todos(
        ids: [String!]!
        data: TodoInputType!
      ): [Todo]
  }
`

const readmeSchema = buildSchema(readmeSDL)
const introspectionQueryJSON = graphqlSync(
  readmeSchema,
  getIntrospectionQuery()
).data as IntrospectionQuery

const options = {
  nullableArrayItems: true,
}

const readmeResult = fromIntrospectionQuery(introspectionQueryJSON, options)

// Get rid of undefined values this way
const cleanedUpReadmeResult = JSON.parse(JSON.stringify(readmeResult))

const startsWithTestGenerator = (stringToTest: string) => {
  return (stringToLookFor: string) =>
    stringToTest.startsWith(`${stringToLookFor}:`)
}

const keyComparator = (a: string, b: string) => {
  // description to the top
  if (['description'].some(startsWithTestGenerator(a))) {
    // If the other one also satisfies the test (which is impossible, but ok) then
    // there is no sort change
    return ['description'].some(startsWithTestGenerator(b)) ? 0 : -1
  }
  if (['description'].some(startsWithTestGenerator(b))) {
    return 1
  }

  // Native Scalars to the bottom
  if (nativeScalarsToFilter.some(startsWithTestGenerator(a))) {
    // If the other one also satisfies the test, then no sort change
    return nativeScalarsToFilter.some(startsWithTestGenerator(b)) ? 0 : 1
  }
  if (nativeScalarsToFilter.some(startsWithTestGenerator(b))) {
    return -1
  }

  // Stay the same
  return 0
}

const output = `### Input

\`\`\`graphql${readmeSDL}\`\`\`

### Output

\`\`\`js
// Output is from call to fromIntrospectionQuery with the following options:
const options = ${inspect(options)}

${inspect(cleanedUpReadmeResult, { depth: null, sorted: keyComparator })}
\`\`\`
`

console.log(`
<BEGIN OUTPUT>
${output}
<END OUTPUT>
`)

if (process.platform === 'darwin') {
  const proc = spawn('pbcopy')
  proc.stdin.write(output)
  proc.stdin.end()
  console.log('OUTPUT COPIED TO YOUR CLIPBOARD!!!\n')
}
