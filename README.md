# 自己紹介ビンゴ

新入生歓迎会向けの自己紹介ビンゴアプリです。React/JavaScript のフロントエンドと、Python/Flask の API を Vercel にデプロイできる構成です。

## 機能

- プロフィール作成
  - 名前、学科、学年、SNSを登録
  - SNSは非公開がデフォルト
- ビンゴ
  - 用意されたお題からランダムに 5x5 マスを生成
  - マスクリック後に「誰と一緒？」で相手のアカウントを選択して記録
- プロフィールカードコレクション
  - 一緒にマスを達成した相手のプロフィールカードをコレクション表示
  - 同じ相手と達成したお題もカード下に表示
- ランキング
  - 達成マス数をもとにランキング表示

## ローカル起動

```bash
npm install
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

Flask APIを単体で確認する場合:

```bash
pip install -r requirements.txt
npm run api
```

APIは `http://localhost:5050/api/health` で確認できます。

## Vercelデプロイ

1. GitHubにこのリポジトリをpush
2. VercelでプロジェクトをImport
3. Framework PresetはVite
4. Build Commandは `npm run build`
5. Output Directoryは `dist`

`vercel.json` により `/api/*` は `api/index.py` のFlask APIにルーティングされます。

## データ保存について

この初期版はフロントエンドの `localStorage` と Flask のインメモリ状態で動きます。Vercel本番で全参加者のデータを永続化する場合は、Vercel Postgres、Supabase、Firebaseなどの外部DBを接続してください。
