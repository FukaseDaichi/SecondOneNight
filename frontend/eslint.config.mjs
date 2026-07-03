import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
    ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
    {
        rules: {
            // 既存コードに <img> が多数。Stage 4 で next/image 移行を検討
            '@next/next/no-img-element': 'off',
            // 既存コードの any は Stage 3 の型付けで解消予定
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    {
        ignores: ['node_modules/**', '.next/**', 'out/**', 'docs/**'],
    },
];
