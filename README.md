# My Best 9 Songs (MVP)

Next.js + TypeScript + Tailwind で作る、GitHub Pages 向け静的Webアプリです。

- iTunes Search API (`country=JP`, `entity=song`) で楽曲検索
- 9曲を選んで 3x3 グリッドを作成
- ローカル保存（localStorage）とシェア文コピー
- サーバー不要 (`output: 'export'`)

## Local Development

```bash
npm install
npm run dev
```

## Static Build

```bash
npm run build
```

`out/` が生成されます。

## GitHub Pages Build Env Example

- `GITHUB_ACTIONS=true`
- `GITHUB_PAGES_REPO=9-musics`

この2つを設定すると `basePath` と `assetPrefix` が `/9-musics` になります。

任意で `NEXT_PUBLIC_BASE_PATH=/your-repo-name` を指定すると、ローカルビルドでも同じ `basePath` を強制できます。
シェアURLを変更したい場合は `NEXT_PUBLIC_SHARE_URL=https://example.com/your-repo/` を設定してください。

## GitHub Pages Deploy (Actions)

1. リポジトリの `Settings > Pages` で `Build and deployment` を `GitHub Actions` に設定
2. `main` か `master` に push
3. `.github/workflows/deploy-pages.yml` が `out/` を自動デプロイ
