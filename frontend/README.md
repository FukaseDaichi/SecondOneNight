# セットアップ

## クローン

npx create-next-app boardgamefront --ts --use-npm --example "https://github.com/FukaseDaichi/BoardGameFront/tree/develop"

## 各種モジュール

-   npx browserslist@latest --update-db
-   npm install --save react-stomp
-   npm i sass
-   npm install interactjs
-   npm install react-color --save
-   npm install react-share
-   npm install react-tsparticles

## TypeScript と ESLint のインストール

-   npm i --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
-   npx tsc --init
-   npx eslint --init

-   npm install --save-dev prettier
-   npm install --save-dev eslint-config-prettier

## react の最新化

-   npm install react@latest react-dom@latest
-   npm i next @latest
-   npm i typescript@latest

## 追跡

    git remote add origin https://FukaseDaichi@github.com/FukaseDaichi/BoardGameFront.git

## 実行

    npm run dev
