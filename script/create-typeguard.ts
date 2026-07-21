import ts, {Program, SourceFile} from "typescript";
import * as fs from 'node:fs';
import * as path from 'node:path';

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

interface Import {
  name: string;
  module: string;
}

interface ImportCollection {
  module: string,
  names: string[]
}

const moduleSpecifier = (from: string, to: string): string => {
  let rel = path.relative(path.dirname(to), from);

  rel = rel.replace(/\\/g, "/");
  rel = rel.replace(/\.[^.]+$/, "");   // .ts, .tsx, ...

  if (!rel.startsWith(".")) {
    rel = "./" + rel;
  }

  return rel;
}


const getImports = (source: SourceFile) => {
  const imports: Import[] = [];
  source.forEachChild(node => {
    if (!ts.isImportDeclaration(node)) {
      return;
    }

    const module = (node.moduleSpecifier as ts.StringLiteral).text;
    const clause = node.importClause;

    if (!clause) {
      return;
    }

    // import { Foo, Bar as Baz } from "..."
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        const localName = element.name.text;

        imports.push({
          name: localName,
          module,
        });
      }
    }

    // import * as Utils from "..."
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      const localName = clause.namedBindings.name.text;

      imports.push({
        name: localName,
        module,
      });
    }

    // import Foo from "..."
    if (clause.name) {
      const localName = clause.name.text;

      imports.push({
        name: localName,
        module,
      });
    }
  });
  return imports;
}

const getInterfaces = (program: Program, source: SourceFile): Interface[] => {
  const checker = program.getTypeChecker();
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
          ?? [],
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

  return interfaces;
};

const analyzeInterfaceFile = (input: string, target: string): {interfaces: Interface[], imports: Import[]} => {
  const program = ts.createProgram([input], {});
  const source = program.getSourceFile(input);
  if (!source) throw new Error('could not read source');
  const interfaces = getInterfaces(program, source);
  const imports = getImports(source);
  const module = moduleSpecifier(input, target);
  imports.push(...interfaces.map((iface: Interface): Import => ({name: iface.name, module})));
  return {interfaces, imports};
}

const wrap = (s: string): string => `(${s})`;
const createTypeCheck = (member: Member, thingName: string = 'thing'): string[] => {
  if (member.optional) {
    return [
      [
        (`!('${member.name}' in ${thingName})`),
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

const collectConditions = (iface: Interface): string[] => {
  const rows = [];
  if (!iface.extends.length) rows.push(`typeof thing === 'object'`, `thing != null`)
  rows.push(...iface.extends.map(ex => `is${ex}(thing)`))
  rows.push(...iface.members.flatMap(member => createTypeCheck(member)));
  return rows;
}

const createImport = (imp: ImportCollection): string =>
  `import {${imp.names.join(', ')}} from '${imp.module}'`;

const functionCreators = {
  typeguard: (iface: Interface): string => {
    const rows = collectConditions(iface);
    return `
export const is${iface.name} = (thing: unknown): thing is ${iface.name} => {
${rows.map(wrap).join(`\n\t&& `)}
  return true;
}`;
  },

  debugTypeguard: (iface: Interface): string => {
    const strCond = (r: string): string =>  `
if (!(${r})) {
 console.warn("condition failed: ${r.replaceAll('\"', '')}");
 return false
}`;

    const rows = collectConditions(iface);
    return `
export const validate${iface.name} = (thing: unknown): thing is ${iface.name} => {
  ${rows.map(strCond).join(`\n`)}
  return true;
}`;
  },

  validator: (iface: Interface): string => {
    const strCond = (row: {condition: string, member: Member}): string =>
`if (!(${row.condition}))\n\t\tfailedConditions.push("${row.member.name.replaceAll('"', '\'')}")`;

    const rows =  iface.members
      .flatMap(member => createTypeCheck(member)
        .map(condition => ({member, condition}))
      );

    return `
export const validate${iface.name} = (thing: unknown): thing is ${iface.name} => {
  if ((typeof thing !== 'object') || (thing == null)) throw new Error('is not an object');
  const failedConditions = [];
${rows.map(strCond).map(l => `\t${l};\n`).join('')}
  if (failedConditions.length) throw new Error('invalid ${iface.name}: ' + failedConditions.join());
  return true;
}`;
  }
}


const createFunctionsFile = (filePath: string, outPath: string, type: keyof typeof functionCreators)=> {
  console.log(`Input: ${filePath}`);
  console.log(`Output: ${outPath}`);
  const r = analyzeInterfaceFile(filePath, outPath);
  const imports = r.imports
    .reduce(
      (c: ImportCollection[], i: Import) => {
        const entry = c.find(e => e.module === i.module);
        if (entry) {
          entry.names.push(i.name);
        } else {
          c.push({module: i.module, names: [i.name]});
        }
        return c;
      },
      <ImportCollection[]>[]
    )
    .map(createImport)
    .join(";\n");
  const typeguards = r.interfaces
    .map(functionCreators[type])
    .join(";\n\n");
  fs.writeFileSync(outPath, imports + ";\n\n\n" + typeguards, 'utf8');
  console.log('done.');
};


createFunctionsFile(
 "/home/pfranck/IdeaProjects/concepts/common/src/interfaces/selector.ts",
  "/home/pfranck/IdeaProjects/concepts/common/src/functions/selector.validator.ts",
  'validator'
);
