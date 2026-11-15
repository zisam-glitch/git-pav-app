import { z } from "zod";

// Prints zod schemas as TypeScript types, for the app's generated contract
// file. It covers the zod types the contracts use and throws on anything
// else, so a new kind of field can't be silently printed as `unknown`.

type Named = Map<unknown, string>;

function print(schema: z.ZodType, named: Named, indent: string, top = false): string {
  const name = named.get(schema);
  if (name && !top) return name;

  if (schema instanceof z.ZodString) {
    return "string";
  }
  if (schema instanceof z.ZodNumber) {
    return "number";
  }
  if (schema instanceof z.ZodBoolean) {
    return "boolean";
  }
  if (schema instanceof z.ZodUnknown) {
    return "unknown";
  }
  if (schema instanceof z.ZodLiteral) {
    return JSON.stringify(schema.value);
  }
  if (schema instanceof z.ZodEnum) {
    return (schema.options as string[]).map((o) => JSON.stringify(o)).join(" | ");
  }
  if (schema instanceof z.ZodRecord) {
    const key = print(schema.keyType as z.ZodType, named, indent);
    const val = print(schema.valueType as z.ZodType, named, indent);
    return `Record<${key}, ${val}>`;
  }
  if (schema instanceof z.ZodNullable) {
    return `${print(schema.unwrap() as z.ZodType, named, indent)} | null`;
  }
  if (schema instanceof z.ZodArray) {
    const inner = print(schema.element as z.ZodType, named, indent);
    return /^[\w.]+$/.test(inner) ? `${inner}[]` : `Array<${inner}>`;
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    const inner = `${indent}  `;
    const lines = Object.entries(shape).map(([key, field]) => {
      const optional = field.isOptional();
      const type = optional && field instanceof z.ZodOptional ? (field.unwrap() as z.ZodType) : field;
      const doc = field.description ? `${inner}/** ${field.description} */\n` : "";
      return `${doc}${inner}${key}${optional ? "?" : ""}: ${print(type, named, inner)};`;
    });
    return `{\n${lines.join("\n")}\n${indent}}`;
  }

  const def = schema._def as unknown as Record<string, unknown>;
  const typeName = (typeof def.type === "string" ? def.type : null) ?? schema.constructor.name;
  throw new Error(`to-typescript: no printer for ${typeName}`);
}

export function contractToTypeScript(contract: Record<string, z.ZodType>, header: string): string {
  const named: Named = new Map(Object.entries(contract).map(([name, schema]) => [schema, name]));
  const blocks = Object.entries(contract).map(([name, schema]) => {
    const doc = schema.description ? `/** ${schema.description} */\n` : "";
    return `${doc}export type ${name} = ${print(schema, named, "", true)};`;
  });
  return `${header}\n\n${blocks.join("\n\n")}\n`;
}
