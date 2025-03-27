# はさみ将棋
オンライン対戦ができるはさみ将棋アプリケーションです。

[https://hasami-shogi.dev](https://hasami-shogi.dev)

<img src="docs/screenshot.png" width="50%">

## はさみ将棋とは
はさみ将棋は、自分の駒を動かして、相手の駒をはさんで取るゲームです。はさむ以外に、端で相手の駒を封じることによって駒を取ることもできます。

9x9の盤面の上下に「歩」と「と」を並べ、交互に指し手を進めていきます。

駒は上下左右に動かすことができます。斜めに動かしたり、相手の駒を飛び越えて移動させることはできません。

## 仕様

### 対局方法
トップにある9つの部屋のどれかに入り対局します。コンピューターによる自動対局機能はないため、必ず2名以上で遊んでください。

先に入室した方が先手になります。

部屋の入室状況は一覧で可視化されます。

### 持ち時間
持ち時間は各自5分（特別対局室のみ10分）です。

### 勝ち負けについて
はさみ将棋の勝敗の付け方は様々ありますが、このアプリケーションでは以下のケースで勝ちとします。
- 相手が投了した時
- 相手の駒が残り一枚以下になった時
- 相手の持ち時間が切れた時

## 技術スタック

- フロントエンド
  - React 19
  - TypeScript 5
  - Vite
  - Tailwind CSS

- バックエンド
  - Firebase
    - Realtime Database

- デプロイ
  - Vercel

## 開発環境

1. リポジトリのクローン
```bash
git clone https://github.com/yuzoiwasaki/hasami-shogi
cd hasami-shogi
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
- `.env.example`をコピーして`.env`を作成し、Firebaseコンソールから取得した値を設定してください：
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_DATABASE_URL=your-database-url
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. 開発サーバの起動
```bash
npm run dev
```