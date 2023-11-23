# What is an AST

Common terminology in computer programming. It is the end result of converting source code into a tree of tokens. The tree is a representation of the abstract syntactic structure of source code. Each node of the tree denotes a construct occurring in the source code. The syntax is "abstract" in not representing every detail appearing in the real syntax.

- A: Abstract
- S: Syntax
- T: Tree

`gql` function essentially takes a string and converts it into an AST.

## Properties

- fieldName
- fieldNodes []
  - kind
  - name
  - ...other stuff
- returnType
- parentType (Query, Mutation)
- ...other stuff

