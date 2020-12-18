# 自分用メモ

## 1 : 環境構築

- 前提 : FORESさんのWindows端末にNode.jsはインストール済みであること。

2の手順でnode_modulesとpackage-lock.jsonができる。  
3はわからぬ。  
4でtscondif.jsonができる。  
5はわからぬ。

1. omiyaディレクトリに移動 : cd omiya
2. typescriptインストール : npm install --save-dev ts-node typescript
3. npm install -D typescript @types/node@latest
4. npx tsc --init
5. npm install -D ts-node
6. npm install -D ts-node-dev

## 2 : 実行

単発実行は1を。起動しっぱなしは2を。普通は2でよいじゃん。

1. npx ts-node file1.ts
2. npx ts-node-dev --respawn file1.ts

## 3 : 配布にあたって

package.json作っておくか。

1. npm init -y
2. package.jsonの中身でバージョン適当に下げる。
