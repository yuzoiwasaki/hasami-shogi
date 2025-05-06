# ディレクトリ構成

以下のディレクトリ構造に従って実装を行ってください：

```
/
├── src/
│   ├── components/          # アプリケーションコンポーネント
│   │   ├── Cell.tsx        # 盤面のセルコンポーネント
│   │   └── RoomManager.tsx # ルーム管理コンポーネント
│   ├── contexts/           # Reactコンテキスト
│   │   └── GameRoomContext.tsx
│   ├── hooks/              # カスタムフック
│   │   ├── useOnlineHasamiShogi.ts
│   │   └── useGameRoom.ts
│   ├── utils/              # ユーティリティ関数
│   │   ├── hasamiShogiLogic.ts
│   │   └── hasamiShogiLogic.test.ts
│   ├── firebase/           # Firebase関連
│   │   └── config.ts
│   ├── constants/          # 定数
│   │   └── rooms.ts
│   ├── assets/            # 静的アセット
│   ├── types.ts           # 型定義
│   ├── App.tsx            # メインアプリケーション
│   ├── App.css            # アプリケーションスタイル
│   ├── index.tsx          # エントリーポイント
│   ├── index.css          # グローバルスタイル
│   └── vite-env.d.ts      # Vite型定義
├── public/                # 静的ファイル
├── node_modules/          # 依存パッケージ
├── .git/                  # Gitリポジトリ
├── .cursor/              # Cursor設定
├── package.json          # プロジェクト設定
├── package-lock.json     # 依存関係ロックファイル
├── tsconfig.json         # TypeScript設定
├── tsconfig.app.json     # アプリケーションTypeScript設定
├── tsconfig.node.json    # Node.js TypeScript設定
├── vite.config.ts        # Vite設定
├── postcss.config.js     # PostCSS設定
├── tailwind.config.js    # Tailwind設定
├── eslint.config.js      # ESLint設定
├── .env.example          # 環境変数サンプル
├── .node-version         # Node.jsバージョン
└── .gitignore           # Git除外設定
```

### 配置ルール

- コンポーネント → `src/components/`
- コンテキスト → `src/contexts/`
- カスタムフック → `src/hooks/`
- ユーティリティ関数 → `src/utils/`
- Firebase関連 → `src/firebase/`
- 型定義 → `src/types.ts`
- 定数 → `src/constants/`
- アセット → `src/assets/` 