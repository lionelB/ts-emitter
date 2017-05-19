import * as ts from 'typescript';
import { EmitterContext } from './emitter';
import {
  addWhitespace,
  emitStatic,
  addSemicolon,
  endNode,
  addTrailingComment
} from './utils';

export function emitType(this: any, node: ts.TypeNode, context: EmitterContext): string {
  const typeEmitterName = `emitType${ts.SyntaxKind[node.kind]}`;
  if (this[typeEmitterName] !== undefined) {
    return this[typeEmitterName](node, context);
  }
  throw new Error(`Unknown type node kind ${ts.SyntaxKind[node.kind]}`);
}

export function emitTypeStringKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('string', node, context);
}

export function emitTypeReadonlyKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('readonly', node, context);
}

export function emitTypeTrueKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('true', node, context);
}

export function emitTypeFalseKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('false', node, context);
}

export function emitTypeUndefinedKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('undefined', node, context);
}

export function emitTypeNumberKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('number', node, context);
}

export function emitTypeBooleanKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('boolean', node, context);
}

export function emitTypeObjectKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('object', node, context);
}

export function emitTypeVoidKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('void', node, context);
}

export function emitTypeNeverKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('never', node, context);
}

export function emitTypeAnyKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('any', node, context);
}

export function emitTypeNullKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('null', node, context);
}

export function emitTypeSymbolKeyword(this: any, node: ts.KeywordTypeNode, context: EmitterContext): string {
  return _emitTypeKeyword('symbol', node, context);
}

export function _emitTypeKeyword(this: any, keyword: string, node: ts.KeywordTypeNode,
  context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(keyword);
  endNode(node, context);
  return source.join('');
}

export function emitTypeTypeReference(this: any, node: ts.TypeReferenceNode, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.typeName, context));
  if (node.typeArguments) {
    emitStatic(source, '<', node, context);
    for (let i = 0, n = node.typeArguments.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.typeArguments[i], context));
      if ((i < n - 1) || node.typeArguments.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
    emitStatic(source, '>', node, context);
  }
  endNode(node, context);
  return source.join('');
}

// tslint:disable-next-line cyclomatic-complexity
export function emitTypeFunctionType(this: any, node: ts.FunctionTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  if (node.name !== undefined) {
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.name, context));
  }
  if (node.typeParameters) {
    emitStatic(source, '<', node, context);
    for (let i = 0, n = node.typeParameters.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.typeParameters[i], context));
      if ((i < n - 1) || node.typeParameters.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
    emitStatic(source, '>', node, context);
  }
  emitStatic(source, '(', node, context);
  if (node.parameters) {
    for (let i = 0, n = node.parameters.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.parameters[i], context));
      if ((i < n - 1) || node.parameters.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
  }
  emitStatic(source, ')', node, context);
  if (node.type) {
    emitStatic(source, '=>', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.type, context));
  }
  endNode(node, context);
  return source.join('');
}

export function emitTypeTypeLiteral(this: any, node: ts.TypeLiteralNode, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '{', node, context);
  if (node.members !== undefined) {
    for (let i = 0, n = node.members.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.members[i], context));
    }
  }
  emitStatic(source, '}', node, context);
  endNode(node, context);
  return source.join('');
}

// tslint:disable-next-line cyclomatic-complexity
export function emitTypeConstructSignature(this: any, node: ts.ConstructSignatureDeclaration,
    context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'new', node, context);
  if (node.typeParameters) {
    emitStatic(source, '<', node, context);
    for (let i = 0, n = node.typeParameters.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.typeParameters[i], context));
      if ((i < n - 1) || node.typeParameters.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
    emitStatic(source, '>', node, context);
  }
  emitStatic(source, '(', node, context);
  for (let i = 0, n = node.parameters.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.parameters[i], context));
    if ((i < n - 1) || node.parameters.hasTrailingComma) {
      emitStatic(source, ',', node.parameters[i], context);
    }
  }
  emitStatic(source, ')', node, context);
  if (node.type) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.type, context));
  }
  addSemicolon(source, node, context);
  endNode(node, context);
  addTrailingComment(source, node, context);
  return source.join('');
}

// tslint:disable-next-line cyclomatic-complexity
export function emitTypeMethodSignature(this: any, node: ts.MethodSignature, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.name, context));
  if (node.questionToken) {
    emitStatic(source, '?', node, context);
  }
  if (node.typeParameters) {
    emitStatic(source, '<', node, context);
    for (let i = 0, n = node.typeParameters.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.typeParameters[i], context));
      if ((i < n - 1) || node.typeParameters.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
    emitStatic(source, '>', node, context);
  }
  emitStatic(source, '(', node, context);
  for (let i = 0, n = node.parameters.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.parameters[i], context));
    if ((i < n - 1) || node.parameters.hasTrailingComma) {
      emitStatic(source, ',', node, context);
    }
  }
  emitStatic(source, ')', node, context);
  if (node.type) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.type, context));
  }
  addSemicolon(source, node, context);
  endNode(node, context);
  addTrailingComment(source, node, context);
  return source.join('');
}

export function emitTypeArrayType(this: any, node: ts.ArrayTypeNode,
    context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.elementType, context));
  emitStatic(source, '[]', node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypeIndexSignature(this: any, node: ts.IndexSignatureDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  if (node.modifiers) {
    node.modifiers.forEach(modifier => {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, modifier, context));
    });
  }
  emitStatic(source, '[', node, context);
  node.parameters.forEach(paramter => {
    addWhitespace(source, node, context);
    source.push(emitType.call(this, paramter, context));
  });
  emitStatic(source, ']', node, context);
  if (node.type) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.type, context));
  }
  if (node.getSourceFile().getFullText().substring(context.offset).trim().startsWith(',')) {
    emitStatic(source, ',', node, context);
  }
  addSemicolon(source, node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypeParameter(this: any, node: ts.ParameterDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  if (node.dotDotDotToken) {
    emitStatic(source, '...', node, context);
  }
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.name, context));
  if (node.questionToken) {
    emitStatic(source, '?', node, context);
  }
  if (node.type) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.type, context));
  }
  endNode(node, context);
  return source.join('');
}

export function emitTypeIdentifier(this: any, node: ts.Identifier, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(node.text);
  endNode(node, context);
  return source.join('');
}

export function emitTypeUnionType(this: any, node: ts.UnionTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  for (let i = 0, n = node.types.length; i < n; i++) {
    const type = node.types[i];
    addWhitespace(source, node, context);
    source.push(emitType.call(this, type, context));
    if ((i < n - 1) || node.types.hasTrailingComma) {
      emitStatic(source, '|', node, context);
    }
  }
  return source.join('');
}

export function emitTypeTypeQuery(this: any, node: ts.TypeQueryNode, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'typeof', node, context);
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.exprName, context));
  return source.join('');
}

export function emitTypePropertySignature(this: any, node: ts.PropertySignature, context: EmitterContext): string {
  const source: string[] = [];
  if (node.modifiers) {
    node.modifiers.forEach(modifier => {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, modifier, context));
    });
  }
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.name, context));
  if (node.questionToken) {
    emitStatic(source, '?', node, context);
  }
  if (node.type) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.type, context));
  }
  if (context.sourceFile.text.substring(context.offset).trim().startsWith(',')) {
    emitStatic(source, ',', node, context);
  }
  addSemicolon(source, node, context);
  endNode(node, context);
  addTrailingComment(source, node, context);
  return source.join('');
}

export function emitTypeFirstNode(this: any, node: ts.QualifiedName, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.left, context));
  emitStatic(source, '.', node, context);
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.right, context));
  endNode(node, context);
  return source.join('');
}

export function emitTypeParenthesizedType(this: any, node: ts.ParenthesizedTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '(', node, context);
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.type, context));
  emitStatic(source, ')', node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypeFirstTypeNode(this: any, node: ts.TypePredicateNode, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.parameterName, context));
  emitStatic(source, 'is', node, context);
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.type, context));
  endNode(node, context);
  return source.join('');
}

// tslint:disable-next-line cyclomatic-complexity
export function emitTypeCallSignature(this: any, node: ts.CallSignatureDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  if (node.typeParameters) {
    emitStatic(source, '<', node, context);
    for (let i = 0, n = node.typeParameters.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.typeParameters[i], context));
      if ((i < n - 1) || node.typeParameters.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
    emitStatic(source, '>', node, context);
  }
  emitStatic(source, '(', node, context);
  if (node.parameters) {
    for (let i = 0, n = node.parameters.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.parameters[i], context));
      if ((i < n - 1) || node.parameters.hasTrailingComma) {
        emitStatic(source, ',', node.parameters[i], context);
      }
    }
  }
  emitStatic(source, ')', node, context);
  if (node.type) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.type, context));
  }
  addSemicolon(source, node, context);
  endNode(node, context);
  addTrailingComment(source, node, context);
  return source.join('');
}

export function emitTypeTypeOperator(this: any, node: ts.TypeOperatorNode, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'keyof', node, context);
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.type, context));
  endNode(node, context);
  return source.join('');
}

// tslint:disable-next-line cyclomatic-complexity
export function emitTypeConstructorType(this: any, node: ts.ConstructorTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'new', node, context);
  if (node.typeParameters) {
    emitStatic(source, '<', node, context);
    for (let i = 0, n = node.typeParameters.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.typeParameters[i], context));
      if ((i < n - 1) || node.typeParameters.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
    emitStatic(source, '>', node, context);
  }
  emitStatic(source, '(', node, context);
  if (node.parameters) {
    for (let i = 0, n = node.parameters.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emitType.call(this, node.parameters[i], context));
      if ((i < n - 1) || node.parameters.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
  }
  emitStatic(source, ')', node, context);
  if (node.type) {
    emitStatic(source, '=>', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.type, context));
  }
  addSemicolon(source, node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypeTypeParameter(this: any, node: ts.TypeParameterDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.name, context));
  if (node.constraint) {
    emitStatic(source, 'extends', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.constraint, context));
  }
  endNode(node, context);
  return source.join('');
}

export function emitTypeLastTypeNode(this: any, node: ts.LiteralTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.literal, context));
  endNode(node, context);
  return source.join('');
}

export function emitTypeTupleType(this: any, node: ts.TupleTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '[', node, context);
  for (let i = 0, n = node.elementTypes.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.elementTypes[i], context));
    if (i < n - 1) {
      emitStatic(source, ',', node, context);
    }
  }
  emitStatic(source, ']', node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypeStringLiteral(this: any, node: ts.StringLiteral, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  const literal = node.getSourceFile().getFullText().substring(node.getStart(), node.getEnd()).trim();
  source.push(literal.substr(0, 1));
  source.push(node.text);
  source.push(literal.substr(-1));
  endNode(node, context);
  return source.join('');
}

export function emitTypeIntersectionType(this: any, node: ts.IntersectionTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  for (let i = 0, n = node.types.length; i < n; i++) {
    const type = node.types[i];
    addWhitespace(source, node, context);
    source.push(emitType.call(this, type, context));
    if ((i < n - 1)) {
      emitStatic(source, '&', node, context);
    }
  }
  endNode(node, context);
  return source.join('');
}

export function emitTypeThisType(this: any, node: ts.ThisTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'this', node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypeFirstLiteralToken(this: any, node: ts.LiteralExpression, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(node.text);
  endNode(node, context);
  return source.join('');
}

export function emitTypeMappedType(this: any, node: ts.MappedTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '{', node, context);
  if (node.readonlyToken) {
    emitStatic(source, 'readonly', node, context);
  }
  if (node.typeParameter) {
    emitStatic(source, '[', node, context);
    addWhitespace(source, node, context);
    source.push(emitTypeMappedTypeTypeParameter.call(this, node.typeParameter, context));
    emitStatic(source, ']', node, context);
  }
  if (node.questionToken) {
    emitStatic(source, '?', node, context);
  }
  emitStatic(source, ':', node, context);
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.type, context));
  addSemicolon(source, node, context);
  emitStatic(source, '}', node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypeMappedTypeTypeParameter(this: any, node: ts.TypeParameterDeclaration,
    context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.name, context));
  if (node.constraint) {
    emitStatic(source, 'in', node, context);
    addWhitespace(source, node, context);
    source.push(emitType.call(this, node.constraint, context));
  }
  endNode(node, context);
  return source.join('');
}

export function emitTypeIndexedAccessType(this: any, node: ts.IndexedAccessTypeNode, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.objectType, context));
  emitStatic(source, '[', node, context);
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.indexType, context));
  emitStatic(source, ']', node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypeComputedPropertyName(this: any, node: ts.ComputedPropertyName,
  context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '[', node, context);
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.expression, context));
  emitStatic(source, ']', node, context);
  endNode(node, context);
  return source.join('');
}

export function emitTypePrefixUnaryExpression(this: any, node: ts.PrefixUnaryExpression,
    context: EmitterContext): string {
  // tslint:disable-next-line cyclomatic-complexity
  function getPrefixUnaryOperator(): string {
    switch (node.operator) {
      case ts.SyntaxKind.PlusToken:
        return '+';
      case ts.SyntaxKind.PlusPlusToken:
        return '++';
      case ts.SyntaxKind.MinusToken:
        return '-';
      case ts.SyntaxKind.MinusMinusToken:
        return '--';
      case ts.SyntaxKind.ExclamationToken:
        return '!';
      case ts.SyntaxKind.TildeToken:
        return '~';
    }
  }
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(getPrefixUnaryOperator());
  addWhitespace(source, node, context);
  source.push(emitType.call(this, node.operand, context));
  endNode(node, context);
  return source.join('');
}
