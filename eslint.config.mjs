// import globals from "globals";
// import pluginJs from "@eslint/js";
// import tseslint from "typescript-eslint";


// /** @type {import('eslint').Linter.Config[]} */
// export default [
//   {files: ["**/*.{js,mjs,cjs,ts}"]},
//   {languageOptions: { globals: globals.browser }},
//   pluginJs.configs.recommended,
//   ...tseslint.configs.recommended,
  
// ];
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"], // Applique ESLint à ces fichiers
    languageOptions: { globals: globals.browser },
    rules: {
      "import/extensions": [
        "error", // Niveau d'erreur (peut être "warn" ou "off" si nécessaire)
        "never", // Interdit l'utilisation des extensions dans les imports
        {
          ts: "never",     // Pas d'extension pour les fichiers TypeScript
          js: "never",     // Pas d'extension pour les fichiers JavaScript
          json: "always",  // Nécessite une extension pour les fichiers JSON
        },
      ],
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { import: importPlugin }, // Ajoute le plugin import
  },
];
