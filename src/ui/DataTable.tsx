import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getPaginationRowModel,
  PaginationState,
} from "@tanstack/react-table";
import { generateCSV } from "@/lib/utils";
import { uploadCSV } from "@/lib/api";

type DataTableProps<T extends Record<string, unknown>> = {
  data: T[];
  label: string;
};

export function DataTable<T extends Record<string, unknown>>({
  data,
  label,
}: DataTableProps<T>) {
  const columns = React.useMemo<ColumnDef<T>[]>(() => {
    return data && data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          accessorKey: key,
          header: key.toUpperCase(),
          cell: (info) => {
            const value = info.getValue();
            return typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value);
          },
        }))
      : [];
  }, [data]);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  const triggerDownload = (csvString: string, fileName = "download.csv") => {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    const csv = generateCSV(data);
    if (csv) {
      triggerDownload(csv, `${label}.csv`);
    }
  };

  const handleUpload = async () => {
    const csv = generateCSV(data);
    if (!csv) return;

    try {
      const result = await uploadCSV(csv, `${label}.csv`, label);
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div>
      <div className="text-xl text-slate-600 py-2 font-bold">{label}</div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full rounded">
          <thead className="bg-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index, arr) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 font-medium text-left border-b whitespace-nowrap ${
                      index === arr.length - 1 ? "w-full" : ""
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell, index, arr) => (
                  <td
                    key={cell.id}
                    className={`px-4 py-3 border-b whitespace-nowrap ${
                      index === arr.length - 1 ? "w-full" : ""
                    }`}
                  >
                    <div className={index === arr.length - 1 ? "w-full" : ""}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-row justify-end items-center gap-4 mt-4">
        <div className="space-x-2">
          <button
            className="px-3 py-1 bg-slate-200 rounded font-bold"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="px-3 py-1 bg-slate-200 rounded font-bold disabled:bg-slate-200/60"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="py-2 px-6 bg-blue-600 text-white font-medium rounded hover:bg-blue-800 shadow-lg"
        >
          Download CSV
        </button>

        <button
          onClick={handleUpload}
          className="py-2 px-6 bg-blue-600 text-white font-medium rounded hover:bg-blue-800 shadow-lg"
        >
          Upload CSV
        </button>
      </div>
    </div>
  );
}
