"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { Table, TablesFormSchema } from "@/lib/schemas";
import { useState } from "react";
import { hasForeignKeyCycle } from "@/lib/utils";

export default function TableForm({
  onSubmitResultAction,
}: {
  onSubmitResultAction: (data: { tables: Table[] }) => void;
}) {
  const [showCycleError, setShowCycleError] = useState(false);
  const form = useForm({
    defaultValues: {
      tables: [
        {
          name: "",
          fields: [
            {
              col_name: "ID",
              data_type: "int",
              foreign_key: undefined,
              is_primary_key: true,
              is_unique: false,
              min: undefined,
              max: undefined,
              example: "",
            },
          ],
          count: 10,
        },
      ],
    } as { tables: Table[] },
    validators: {
      onSubmit: TablesFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (hasForeignKeyCycle(value.tables)) {
        setShowCycleError(true);
        return; // block submission
      }

      onSubmitResultAction(value);
    },
  });

  const tables = useStore(form.store, (state) => state.values.tables);
  const formErrorMap = useStore(form.store, (state) => state.errorMap);

  return (
    <>
      {showCycleError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Invalid Foreign Key Setup
            </h2>
            <p className="mb-4">
              Foreign key relationships form a cycle. Please remove the circular
              dependency between tables.
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowCycleError(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.validate("submit");
          form.handleSubmit();
        }}
        className="flex flex-col gap-4 mb-12"
      >
        {/* Error display */}
        {formErrorMap.onSubmit ? (
          <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-800 shadow-sm space-y-2">
            <p className="font-semibold">Please complete the following:</p>
            <ul className="list-disc list-inside space-y-1">
              {Array.from(
                new Set(
                  Object.values(formErrorMap.onSubmit)
                    .flat()
                    .map((issue) => issue.message),
                ),
              ).map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <form.Field name="tables" mode="array">
          {(tablesField) => (
            <div className="flex flex-col gap-4">
              {tablesField.state.value.map((_, tableIndex) => (
                <div key={tableIndex}>
                  {/* Table name input */}
                  <form.Field name={`tables[${tableIndex}].name`}>
                    {(field) => (
                      <input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter table name"
                        className="text-xl text-slate-600 placeholder-slate-300 bg-transparent outline-0 py-2 font-bold"
                      />
                    )}
                  </form.Field>

                  {/* Fields block */}
                  <form.Field
                    name={`tables[${tableIndex}].fields`}
                    mode="array"
                  >
                    {(fieldsField) => {
                      const columns = fieldsField.state.value;

                      return (
                        <div className="flex flex-row rounded">
                          <div
                            className="grid overflow-x-auto max-w-screen-lg rounded-s"
                            style={{
                              gridTemplateColumns: `repeat(${columns.length}, minmax(260px, 1fr))`,
                            }}
                          >
                            {columns.map((_, fieldIndex) => (
                              <div key={fieldIndex}>
                                {/* col_name */}
                                <form.Field
                                  name={`tables[${tableIndex}].fields[${fieldIndex}].col_name`}
                                >
                                  {(nameField) => (
                                    <div className="bg-slate-300 text-center px-4 py-3 text-lg font-medium">
                                      <input
                                        value={nameField.state.value}
                                        onChange={(e) =>
                                          nameField.handleChange(e.target.value)
                                        }
                                        className="w-full bg-transparent text-center outline-none placeholder-slate-400"
                                        placeholder="Enter name"
                                      />
                                    </div>
                                  )}
                                </form.Field>

                                {/* is_primary_key */}
                                <form.Field
                                  name={`tables[${tableIndex}].fields[${fieldIndex}].is_primary_key`}
                                >
                                  {(pkField) => (
                                    <div className="px-4 py-3 text-base">
                                      <label className="flex gap-2 justify-center">
                                        <input
                                          type="checkbox"
                                          name={`primary_key_${tableIndex}`}
                                          checked={pkField.state.value}
                                          onChange={(e) =>
                                            pkField.handleChange(
                                              e.target.checked,
                                            )
                                          }
                                        />
                                        Set as primary key
                                      </label>
                                    </div>
                                  )}
                                </form.Field>

                                {/* is_unique */}
                                <form.Field
                                  name={`tables[${tableIndex}].fields[${fieldIndex}].is_unique`}
                                >
                                  {(uniqField) => (
                                    <div className="px-4 py-3 text-base">
                                      <label className="flex gap-2 justify-center">
                                        <input
                                          type="checkbox"
                                          checked={uniqField.state.value}
                                          onChange={(e) =>
                                            uniqField.handleChange(
                                              e.target.checked,
                                            )
                                          }
                                        />
                                        Make unique
                                      </label>
                                    </div>
                                  )}
                                </form.Field>

                                {/* data_type */}
                                <form.Field
                                  name={`tables[${tableIndex}].fields[${fieldIndex}].data_type`}
                                  listeners={{
                                    onChange: ({ value }) => {
                                      if (
                                        value === "int" &&
                                        tables[tableIndex].fields[fieldIndex]
                                          .col_name !== "ID"
                                      ) {
                                        form.setFieldValue(
                                          `tables[${tableIndex}].fields[${fieldIndex}].min`,
                                          0,
                                        );
                                        form.setFieldValue(
                                          `tables[${tableIndex}].fields[${fieldIndex}].max`,
                                          9999,
                                        );
                                      } else {
                                        form.setFieldValue(
                                          `tables[${tableIndex}].fields[${fieldIndex}].min`,
                                          undefined,
                                        );
                                        form.setFieldValue(
                                          `tables[${tableIndex}].fields[${fieldIndex}].max`,
                                          undefined,
                                        );
                                      }
                                    },
                                  }}
                                >
                                  {(typeField) => (
                                    <div className="text-center px-4 py-3 text-base flex flex-col gap-5">
                                      <select
                                        value={typeField.state.value}
                                        onChange={(e) =>
                                          typeField.handleChange(e.target.value)
                                        }
                                        className="w-full bg-transparent"
                                      >
                                        <option value="">
                                          --Select an option--
                                        </option>
                                        {tables.length > 1 && (
                                          <option value="foreign_key">
                                            Foreign key
                                          </option>
                                        )}
                                        <option value="string">String</option>
                                        <option value="int">Integer</option>
                                        <option value="float">Float</option>
                                        <option value="enum">Enum</option>
                                        <option value="date">Date</option>
                                        <option value="time">Time</option>
                                        <option value="datetime">
                                          Datetime
                                        </option>
                                        <option value="year">Year</option>
                                        <option value="array">Array</option>
                                        <option value="object">Object</option>
                                      </select>

                                      {/* Min and max values for integer */}
                                      {typeField.state.value === "int" &&
                                        tables[tableIndex].fields[fieldIndex]
                                          .col_name !== "ID" && (
                                          <>
                                            <form.Field
                                              name={`tables[${tableIndex}].fields[${fieldIndex}].min`}
                                            >
                                              {(minField) => (
                                                <div className="flex items-center space-x-2">
                                                  <label className="w-full">
                                                    Minimum value:
                                                  </label>
                                                  <input
                                                    type="number"
                                                    min={0}
                                                    max={9999}
                                                    value={minField.state.value}
                                                    onChange={(e) =>
                                                      minField.handleChange(
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="border rounded py-0.5 text-lg bg-transparent outline-0 font-bold text-center "
                                                  />
                                                </div>
                                              )}
                                            </form.Field>
                                            <form.Field
                                              name={`tables[${tableIndex}].fields[${fieldIndex}].max`}
                                            >
                                              {(maxField) => (
                                                <div className="flex items-center space-x-2">
                                                  <label className="w-full">
                                                    Maximum value:
                                                  </label>
                                                  <input
                                                    type="number"
                                                    min={0}
                                                    max={9999}
                                                    value={maxField.state.value}
                                                    onChange={(e) =>
                                                      maxField.handleChange(
                                                        Number(e.target.value),
                                                      )
                                                    }
                                                    className="border rounded py-0.5 text-lg bg-transparent outline-0 font-bold text-center "
                                                  />
                                                </div>
                                              )}
                                            </form.Field>
                                          </>
                                        )}

                                      {/* Foreign key */}
                                      {tables.length > 1 &&
                                        typeField.state.value ===
                                          "foreign_key" && (
                                          <form.Field
                                            name={`tables[${tableIndex}].fields[${fieldIndex}].foreign_key`}
                                          >
                                            {(foreignKeyField) => (
                                              <select
                                                value={
                                                  foreignKeyField.state.value
                                                }
                                                onChange={(e) =>
                                                  foreignKeyField.handleChange(
                                                    e.target.value,
                                                  )
                                                }
                                              >
                                                <option value="">
                                                  Select foreign key target
                                                </option>
                                                {tables
                                                  .filter(
                                                    (table, i) =>
                                                      table.name &&
                                                      i !== tableIndex,
                                                  )
                                                  .flatMap((table) =>
                                                    table.fields.map(
                                                      (field) => (
                                                        <option
                                                          key={`${table.name}.${field.col_name}`}
                                                          value={`${table.name}.${field.col_name}`}
                                                        >
                                                          {table.name}.
                                                          {field.col_name}
                                                        </option>
                                                      ),
                                                    ),
                                                  )}
                                              </select>
                                            )}
                                          </form.Field>
                                        )}
                                    </div>
                                  )}
                                </form.Field>

                                {tables[tableIndex].fields[fieldIndex]
                                  .col_name !== "ID" && (
                                  <>
                                    <form.Field
                                      name={`tables[${tableIndex}].fields[${fieldIndex}].example`}
                                    >
                                      {(field) => (
                                        <textarea
                                          value={field.state.value}
                                          onChange={(e) =>
                                            field.handleChange(e.target.value)
                                          }
                                          className="mt-2 w-full bg-transparent text-center outline-none placeholder-slate-400"
                                          placeholder="Give an example"
                                        />
                                      )}
                                    </form.Field>

                                    <button
                                      onClick={() =>
                                        fieldsField.removeValue(fieldIndex)
                                      }
                                      type="button"
                                      className="px-6 py-1 bg-red-700 font-medium transition-colors rounded text-slate-50"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() =>
                              fieldsField.pushValue({
                                col_name: "",
                                data_type: "",
                                is_primary_key: false,
                                is_unique: false,
                              })
                            }
                            type="button"
                            className="min-w-28 bg-slate-200 hover:bg-slate-300 transition-colors rounded-e"
                          >
                            Add column
                          </button>
                        </div>
                      );
                    }}
                  </form.Field>

                  {/* Count */}
                  <form.Field name={`tables[${tableIndex}].count`}>
                    {(field) => (
                      <div className="flex items-center space-x-2 pt-4">
                        <label>Number of records: </label>
                        <button
                          type="button"
                          onClick={() =>
                            field.handleChange((+field.state.value || 0) - 1)
                          }
                          className="px-3 py-1 bg-slate-200 rounded font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          className="border rounded py-0.5 no-spinner text-lg bg-transparent outline-0 font-bold text-center w-16"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            field.handleChange((+field.state.value || 0) + 1)
                          }
                          className="px-3 py-1 bg-slate-200 rounded font-bold"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </form.Field>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  tablesField.pushValue({
                    name: "",
                    fields: [
                      {
                        col_name: "ID",
                        data_type: "int",
                        is_primary_key: true,
                        is_unique: false,
                      },
                    ],
                    count: 10,
                  })
                }
                className="px-4 py-2 bg-slate-300 font-medium rounded hover:bg-slate-400"
              >
                Add Table
              </button>
            </div>
          )}
        </form.Field>

        <form.Subscribe>
          <div
            className={`${showCycleError && "z-0"} fixed bottom-0 left-0 z-50 w-1/2 py-3 px-4 flex justify-end bg-slate-50/50 backdrop-blur-md`}
          >
            <button
              type="submit"
              className="py-2 px-6 bg-blue-600 text-white font-medium rounded hover:bg-blue-800 shadow-lg"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "smooth",
                });
              }}
            >
              Generate data
            </button>
          </div>
        </form.Subscribe>
      </form>
    </>
  );
}
