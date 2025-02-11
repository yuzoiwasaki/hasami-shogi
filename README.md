# はさみ将棋
React + TypeScript + Tailwind CSS で作られたはさみ将棋アプリケーションです。

[https://hasami-shogi.dev](https://hasami-shogi.dev)

<img src="docs/screenshot.png" width="50%">

## ゲームのルール

はさみ将棋は、9×9のマス目で遊ぶ2人用のボードゲームです。

### 基本ルール

1. **初期配置**
   - 先手（歩）：最下段に9個の駒を配置
   - 後手（と）：最上段に9個の駒を配置

2. **駒の動き**
   - 駒は縦・横の直線方向にのみ移動可能
   - 他の駒を飛び越えることはできない
   - 1回の手番で1つの駒のみ動かせる

3. **駒の取り方（はさみ）**
   - 自分の駒2つで相手の駒を縦または横方向ではさむと、はさまれた駒を取ることができる
   - 複数の駒を同時にはさむことも可能
   - はさみは移動後に判定される

4. **勝利条件**
   以下のいずれかの条件を満たすと勝利：
   - 相手の駒をすべて取る
   - 相手の駒が動けない状態にする

### 特記事項

- 斜め方向の移動ははさみの判定も含めて不可
- 駒を取ることは任意ではなく、はさんだ場合は必ず取らなければならない
- 一度の手で複数の方向のはさみが成立した場合、すべての方向の駒を取る

### ゲームの進行

1. 先手（歩）から開始
2. 交互に1手ずつ指す
3. 勝利条件を満たすまで継続

## バージョン

### 0.1.0
最低限の機能を実装
