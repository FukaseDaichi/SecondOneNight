import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
    ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
    {
        rules: {
            // 既存コードに <img> が多数。future の画像最適化で next/image 移行を検討
            '@next/next/no-img-element': 'off',
            // 既存コードの any は future の strict 化で段階的に解消する
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    {
        ignores: ['node_modules/**', '.next/**', 'out/**', 'docs/**'],
    },
];
