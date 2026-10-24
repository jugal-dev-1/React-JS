import { cpSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../node_modules/tinymce", import.meta.url));
const destination = fileURLToPath(new URL("../public/tinymce", import.meta.url));

cpSync(source, destination, { recursive: true });
console.log("Copied TinyMCE assets to public/tinymce.");
