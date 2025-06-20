"use client";

import { useState } from "react";
import { callAzureEndpoint } from "@/lib/api";
import { Table } from "@/lib/schemas";
import TableForm from "@/ui/TableForm";
import { DataTable } from "@/ui/DataTable";
import { cleanUndefined } from "@/lib/utils";

export default function Home() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-[family-name:var(--font-geist-sans)]">
      <main className="min-h-screen grid grid-cols-2 gap-8 px-8 py-4">
        <TableForm
          onSubmitResultAction={async (userinput: { tables: Table[] }) => {
            setLoading(true);
            setData({});

            const cleanedInput = cleanUndefined(userinput);
            console.log({ userinput: cleanedInput });

            try {
              const result = await callAzureEndpoint({
                userinput: cleanedInput,
              });
              console.log(result);
              setData(result);
            } catch (e) {
              console.error("Error generating data", e);
            } finally {
              setLoading(false);
            }
          }}
        />

        <div className="flex flex-col gap-8">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="h-10 w-10 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Object.keys(data).length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="font-medium text-slate-400">
                Generate data first
              </div>
            </div>
          ) : (
            Object.entries(data).map(([key, value]) => (
              <DataTable key={key} label={key} data={value as object[]} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
