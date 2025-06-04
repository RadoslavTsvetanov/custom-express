import antfu from "@antfu/eslint-config";

export default antfu(
    {
        type: "app",
        typescript: true,
        formatters: true,
        stylistic: {
            indent: 4,
            semi: true,
            quotes: "double",
        },
    },
    {
        files: ["**/*.{js,ts,jsx,tsx}"], // <-- put here
        rules: {
            "ts/no-redeclare": "off",
            "ts/consistent-type-definitions": ["error", "type"],
            "no-console": ["warn"],
            "antfu/no-top-level-await": ["off"],
            "node/prefer-global/process": ["off"],
            "node/no-process-env": ["error"],
            "style/type-generic-spacing": "off",
            "perfectionist/sort-imports": ["error", {
                tsconfigRootDir: ".",
            }],
            "unicorn/filename-case": ["error", {
                case: "kebabCase",
                ignore: ["README.md"],
            }],
        },
    },
);
