import * as ts from 'typescript';

import { emitType } from './types';
import { addWhitespace, emitStatic } from './utils';

export interface EmitterContext {
  sourceFile: ts.SourceFile;
  offset: number;
}

export function emit(this: any, node: ts.Node, context: EmitterContext): string {
  const emitterFunction = `emit${ts.SyntaxKind[node.kind]}`;
  if (this[emitterFunction] !== undefined) {
    return this[emitterFunction](node, context);
  }
  throw new Error(`Unknown node kind ${ts.SyntaxKind[node.kind]}`);
}

export function emitSourceFile(this: any, node: ts.SourceFile, context: EmitterContext): string {
  const source: string[] = [];
  node.forEachChild(child => {
    addWhitespace(source, node, context);
    source.push(emit.call(this, child, context));
  });
  context.offset = node.end;
  return source.join('');
}

export function emitEndOfFileToken(this: any, node: ts.EndOfFileToken, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  context.offset = node.end;
  return source.join('');
}

export function emitClassDeclaration(this: any, node: ts.ClassDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'class', node, context);
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.name, context));
  if (node.heritageClauses) {
    emitStatic(source, 'extends', node, context);
    for (let i = 0, n = node.heritageClauses.length; i < n; i++) {
      addWhitespace(source, node, context);
      source.push(emit.call(this, node.heritageClauses[i], context));
      if ((i < n - 1) || node.heritageClauses.hasTrailingComma) {
        emitStatic(source, ',', node, context);
      }
    }
  }
  emitStatic(source, '{', node, context);
  node.members.forEach(member => {
    addWhitespace(source, node, context);
    source.push(emit.call(this, member, context));
  });
  emitStatic(source, '}', node, context);
  context.offset = node.end;
  return source.join('');
}

export function emitHeritageClause(this: any, node: ts.HeritageClause, context: EmitterContext): string {
  const source: string[] = [];
  for (let i = 0, n = node.types.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.types[i], context));
    if ((i < n - 1) || node.types.hasTrailingComma) {
      emitStatic(source, ',', node, context);
    }
  }
  context.offset = node.end;
  return source.join('');
}

export function emitExpressionWithTypeArguments(this: any, node: ts.ExpressionWithTypeArguments,
  context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.expression, context));
  context.offset = node.end;
  return source.join('');
}

export function emitConstructor(this: any, node: ts.ConstructorDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'constructor', node, context);
  emitStatic(source, '(', node, context);
  for (let i = 0, n = node.parameters.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.parameters[i], context));
    if ((i < n - 1) || node.parameters.hasTrailingComma) {
      emitStatic(source, ',', node, context);
    }
  }
  emitStatic(source, ')', node, context);
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.body, context));
  context.offset = node.end;
  return source.join('');
}

export function emitVariableStatement(this: any, node: ts.VariableStatement, context: EmitterContext): string {
  const source: string[] = [];
  node.forEachChild(child => {
    addWhitespace(source, node, context);
    source.push(emit.call(this, child, context));
  });
  if (context.sourceFile.text.substring(context.offset).startsWith(';')) {
    emitStatic(source, ';', node, context);
  }
  context.offset = node.end;
  return source.join('');
}

export function emitExpressionStatement(this: any, node: ts.ExpressionStatement, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.expression, context));
  if (context.sourceFile.text.substring(context.offset).startsWith(';')) {
    emitStatic(source, ';', node, context);
  }
  context.offset = node.end;
  return source.join('');
}

export function emitReturnStatement(this: any, node: ts.ReturnStatement, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'return', node, context);
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.expression, context));
  if (context.sourceFile.text.substring(context.offset).startsWith(';')) {
    emitStatic(source, ';', node, context);
  }
  context.offset = node.end;
  return source.join('');
}

export function emitVariableDeclarationList(this: any, node: ts.VariableDeclarationList,
  context: EmitterContext): string {
  const source: string[] = [];
  switch ((node as ts.VariableDeclarationList).flags) {
    case ts.NodeFlags.Const:
      emitStatic(source, 'const', node, context);
      break;
    case ts.NodeFlags.Let:
      emitStatic(source, 'let', node, context);
      break;
    default:
      emitStatic(source, 'var', node, context);
  }
  node.forEachChild(child => {
    addWhitespace(source, node, context);
    source.push(emit.call(this, child, context));
  });
  context.offset = node.end;
  return source.join('');
}

export function emitVariableDeclaration(this: any, node: ts.VariableDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.name, context));
  if (node.type !== undefined) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType(node.type, context));
  }
  if (node.initializer !== undefined) {
    emitStatic(source, '=', node, context);
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.initializer, context));
  }
  context.offset = node.end;
  return source.join('');
}

export function emitFunctionDeclaration(this: any, node: ts.FunctionDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'function', node, context);
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.name, context));
  emitStatic(source, '(', node, context);
  for (let i = 0, n = node.parameters.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.parameters[i], context));
    if ((i < n - 1) || node.parameters.hasTrailingComma) {
      emitStatic(source, ',', node, context);
    }
  }
  emitStatic(source, ')', node, context);
  if (node.type !== undefined) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType(node.type, context));
  }
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.body, context));
  context.offset = node.end;
  return source.join('');
}

export function emitFunctionExpression(this: any, node: ts.FunctionExpression, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, 'function', node, context);
  if (node.name) {
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.name, context));
  }
  emitStatic(source, '(', node, context);
  for (let i = 0, n = node.parameters.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.parameters[i], context));
    if ((i < n - 1) || node.parameters.hasTrailingComma) {
      emitStatic(source, ',', node, context);
    }
  }
  emitStatic(source, ')', node, context);
  if (node.type !== undefined) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType(node.type, context));
  }
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.body, context));
  context.offset = node.end;
  return source.join('');
}

export function emitCallExpression(this: any, node: ts.CallExpression, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.expression, context));
  emitStatic(source, '(', node, context);
  for (let i = 0, n = node.arguments.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.arguments[i], context));
    if ((i < n - 1) || node.arguments.hasTrailingComma) {
      emitStatic(source, ',', node, context);
    }
  }
  emitStatic(source, ')', node, context);
  context.offset = node.end;
  return source.join('');
}

export function emitPropertyAccessExpression(this: any, node: ts.PropertyAccessExpression,
  context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.expression, context));
  emitStatic(source, '.', node, context);
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.name, context));
  context.offset = node.end;
  return source.join('');
}

export function emitObjectLiteralExpression(this: any, node: ts.ObjectLiteralExpression,
  context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '{', node, context);
  addWhitespace(source, node, context);
  for (let i = 0, n = node.properties.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.properties[i], context));
    if ((i < n - 1) || node.properties.hasTrailingComma) {
      emitStatic(source, ',', node, context);
    }
  }
  emitStatic(source, '}', node, context);
  context.offset = node.end;
  return source.join('');
}

export function emitPropertyAssignment(this: any, node: ts.PropertyAssignment,
  context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.name, context));
  emitStatic(source, ':', node, context);
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.initializer, context));
  context.offset = node.end;
  return source.join('');
}

export function emitArrowFunction(this: any, node: ts.ArrowFunction, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '(', node, context);
  for (let i = 0, n = node.parameters.length; i < n; i++) {
    addWhitespace(source, node, context);
    source.push(emit.call(this, node.parameters[i], context));
    if ((i < n - 1) || node.parameters.hasTrailingComma) {
      emitStatic(source, ',', node, context);
    }
  }
  emitStatic(source, ')', node, context);
  emitStatic(source, '=>', node, context);
  source.push(emit.call(this, node.body, context));
  return source.join('');
}

export function emitParameter(this: any, node: ts.ParameterDeclaration, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.name, context));
  if (node.type) {
    emitStatic(source, ':', node, context);
    addWhitespace(source, node, context);
    source.push(emitType(node.type, context));
  }
  return source.join('');
}

export function emitBlock(this: any, node: ts.Block, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '{', node, context);
  node.statements.forEach(statement => {
    addWhitespace(source, node, context);
    source.push(emit.call(this, statement, context));
  });
  emitStatic(source, '}', node, context);
  context.offset = node.end;
  return source.join('');
}

export function emitBinaryExpression(this: any, node: ts.BinaryExpression, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.left, context));
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.operatorToken, context));
  addWhitespace(source, node, context);
  source.push(emit.call(this, node.right, context));
  context.offset = node.end;
  return source.join('');
}

export function emitPlusToken(this: any, node: ts.Token<ts.SyntaxKind.PlusToken>, context: EmitterContext): string {
  const source: string[] = [];
  emitStatic(source, '+', node, context);
  context.offset = node.end;
  return source.join('');
}

export function emitIdentifier(this: any, node: ts.Identifier, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(node.text);
  context.offset = node.end;
  return source.join('');
}

export function emitStringLiteral(this: any, node: ts.StringLiteral, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  const literal = context.sourceFile.text.substring(node.pos, node.end).trim();
  source.push(literal.substr(0, 1));
  source.push(node.text);
  source.push(literal.substr(-1));
  context.offset = node.end;
  return source.join('');
}

export function emitFirstLiteralToken(this: any, node: ts.LiteralExpression, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(node.text);
  context.offset = node.end;
  return source.join('');
}

export function emitTrueKeyword(this: any, node: ts.Node, context: EmitterContext): string {
  return _emitKeyword('true', node, context);
}

export function emitFalseKeyword(this: any, node: ts.Node, context: EmitterContext): string {
  return _emitKeyword('false', node, context);
}

export function emitSuperKeyword(this: any, node: ts.Node, context: EmitterContext): string {
  return _emitKeyword('super', node, context);
}

function _emitKeyword(this: any, keyword: string, node: ts.Node, context: EmitterContext): string {
  const source: string[] = [];
  addWhitespace(source, node, context);
  source.push(keyword);
  context.offset = node.end;
  return source.join('');
}
