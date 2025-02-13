// Import Node.js file operations
import { readFile, writeFile } from "fs/promises";
import { vectors } from "./vectors-aes.js"; // Update path if needed

async function runCode ()
{
  const jsonFilePath = "./vectors-aes.json"; // Path to save the output JSON

  // Function to convert an array of hex values to decimal values
  function convertHexArrayToDecimal(hexArray: number[]): number[] {
    return hexArray.map((hex) => Number(hex)); // Converts each hex number to decimal
  }

  // Convert hex arrays to decimal arrays in each test vector
  const convertedVectors = vectors.map((vector: any) => ({
    key: convertHexArrayToDecimal(vector.key),
    pt: convertHexArrayToDecimal(vector.pt),
    ct: convertHexArrayToDecimal(vector.ct),
  }));

  // Write the JSON file
  await writeFile(jsonFilePath, JSON.stringify(convertedVectors, null, 2));
  console.log(`Converted JSON saved to ${jsonFilePath}`);
}

runCode();
