import ts from "typescript";
import * as fs from 'node:fs';

const filePath = "/home/pfranck/IdeaProjects/concepts/common/src/interfaces/concept.ts";
const outPath = "/home/pfranck/IdeaProjects/concepts/common/src/functions/concept.typeguards.ts";
const createDebugTypeGuards = false;

interface Member {
  name: string;
  type: string;
  optional: boolean;
}

interface Interface {
  name: string;
  members: Member[];
  extends: string[];
}

const getInterfaces = (filePath: string): Interface[] => {
  const program = ts.createProgram([filePath], {});
  const checker = program.getTypeChecker();

  const source = program.getSourceFile(filePath);
  if (!source) throw new Error('could not read source');

  const interfaces: Interface[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isInterfaceDeclaration(node)) {
      const iface: Interface = {
        name: node.name.text,
        members: [],
        extends:
          node.heritageClauses
            ?.filter(h => h.token === ts.SyntaxKind.ExtendsKeyword)
            .flatMap(h => h.types.map(t => t.expression.getText()))
          ?? []
      }

      for (const member of node.members) {
        if (!ts.isPropertySignature(member) || !member.name) {
          continue;
        }
        const name = member.name.getText();
        let type = "unknown";
        let optional = !!member.questionToken;
        if (member.type) {
          const t = checker.getTypeFromTypeNode(member.type);
          type = checker.typeToString(t);
        }
        iface.members.push({name, type, optional});
      }
      interfaces.push(iface);
    }
    ts.forEachChild(node, visit);
  }

  source.forEachChild(visit);

  console.log(interfaces);
  return interfaces;
};

const createTypeGuard = (iface: Interface): string => {
  const wrap = (s: string): string => `(${s})`;
  const createTypeCheck = (member: Member, thingName: string = 'thing'): string[] => {
    if (member.optional) {
      return [
        [
          (`'${member.name}' ! in ${thingName}`),
          createTypeCheck({...member, optional: false}).join(' && ')
        ]
          .map(wrap)
          .join(' || ')
      ];
    }

    if (member.type.includes('|')) {
      const options: string[] = [];
      const types = member.type.split('|').map(s => s.trim());
      const stringTypes = types
        .filter(t => t.startsWith('"') && t.endsWith('"'));
      const nonStringTypes = types
        .filter(t => !stringTypes.includes(t));
      if (stringTypes.length > 1) {
        options.push(wrap(`typeof ${thingName}.${member.name} === 'string' && [${stringTypes.join()}].includes(${thingName}.${member.name})`));
      } else {
        nonStringTypes.push(...stringTypes);
      }
      options.push(
        ...nonStringTypes
          .map(type => wrap(
            createTypeCheck({name: member.name, type, optional: false})
              .slice(1)
              .join(' && ')
          ))
      );
      return [
        `'${member.name}' in ${thingName}`,
        options.join(' || ')
      ];
    }
    if (member.type.startsWith('"') && member.type.endsWith('"')) {
      return [
        `'${member.name}' in ${thingName}`,
        `typeof ${thingName} === 'string'`,
        `${thingName} === ${member.type}`
      ];
    }
    if (member.type.endsWith('[]')) {
      const subCheck =
        ['string', 'number', 'boolean'].includes(member.type)
          ? `e => typeof e.${member.name} === '${member.type}'`
          : `is${member.type.substring(0, member.type.length - 2)}`;
      return [
        `'${member.name}' in ${thingName}`,
        `Array.isArray(${thingName}.${member.name})`,
        `thing.${member.name}.every(${subCheck})`
      ];
    }
    if (['string', 'number', 'boolean'].includes(member.type)) {
      return [
        `'${member.name}' in ${thingName}`,
        `typeof ${thingName}.${member.name} === '${member.type}'`
      ];
    }
    return [
      `'${member.name}' in ${thingName}`,
      `is${member.type}(${thingName}.${member.name})`
    ]
  }
  const signature = `const is${iface.name} = (thing: unknown): thing is ${iface.name} => \n\t`;
  const rows = [];
  if (!iface.extends.length) rows.push(`typeof thing === 'object'`, `thing != null`)
  rows.push(...iface.extends.map(ex => `is${ex}(thing)`))
  rows.push(...iface.members.flatMap(member => createTypeCheck(member)));

  if (createDebugTypeGuards) {
    return signature
      + '{'
      + rows
        .map(r => `
  if (!(${r})) {
   console.warn("condition failed: ${r.replaceAll('\"', '')}");
   return false
  }`)
        .join(`\n`)
  + `
  return true;
}`;
  }

  return signature + rows.map(wrap).join(`\n\t&& `);
}

const i = getInterfaces(filePath);
const c = i.map(createTypeGuard).join(";\n\n");
fs.writeFileSync(outPath, c, 'utf8');
