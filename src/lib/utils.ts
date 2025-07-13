import { Table } from "@/lib/schemas";

export const generateCSV = <T extends Record<string, unknown>>(data: T[]): string | null => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  const csvString = [
    headers,
    ...data.map((item) => headers.map((key) => item[key])),
  ]
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  return csvString;
};

export const cleanUndefined = (obj: {
  tables: Table[];
}): { tables: Table[] } => {
  const cleanTable = (table: Table): Table => {
    return {
      ...table,
      fields: table.fields.map((field) =>
        Object.fromEntries(
          Object.entries(field).filter(([, v]) => v !== undefined),
        ),
      ) as Table["fields"],
    };
  };

  return {
    tables: obj.tables.map(cleanTable),
  };
};

export const hasForeignKeyCycle = (tables: Table[]): boolean => {
  const graph: Record<string, string[]> = {};

  for (const table of tables) {
    graph[table.name] = [];

    for (const field of table.fields) {
      if (
        field.data_type === "foreign_key" &&
        typeof field.foreign_key === "string"
      ) {
        const [referencedTable] = field.foreign_key.split(".");
        if (referencedTable && referencedTable !== table.name) {
          graph[table.name].push(referencedTable);
        }
      }
    }
  }

  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string): boolean {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    stack.add(node);

    for (const neighbor of graph[node] || []) {
      if (dfs(neighbor)) return true;
    }

    stack.delete(node);
    return false;
  }

  return Object.keys(graph).some(dfs);
};
