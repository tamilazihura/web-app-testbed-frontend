import axios from "axios";
import { Table } from "./schemas";

export async function callAzureEndpoint(data: {
  userinput: { tables: Table[] };
}) {
  try {
    const response = await axios.post("/api/proxy-azure", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // first endpoint
    // console.log("Response:", response.data);
    // return response.data.output;

    // second endpoint
    const parsedOutput = JSON.parse(response.data.output);
    console.log("Response:", parsedOutput);
    return parsedOutput;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        console.error("Request timed out");
      } else {
        console.error("Axios error calling Azure endpoint:", error.message);
      }
      return error;
    } else {
      console.error("Non-Axios error calling Azure endpoint:", error);
      return error;
    }
  }
}

export async function uploadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const file = new File([blob], filename, { type: "text/csv" });

  const response = await fetch("/api/upload-csv", {
    method: "POST",
    headers: {
      "Content-Type": "text/csv",
      "x-filename": filename,
    },
    body: file,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Upload failed");
  }

  return result;
}
