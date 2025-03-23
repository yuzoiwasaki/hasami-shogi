# はさみ将棋
React + TypeScript + Tailwind CSS で作られたはさみ将棋アプリケーションです。

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
持ち時間は5分です。

### 勝ち負けについて
はさみ将棋の勝敗の付け方は様々ありますが、このアプリケーションでは以下のケースで勝ちとします。
- 相手が投了した時
- 相手の駒を全て取った時
- 相手に動かせる駒がない時
- 相手の持ち時間が切れた時
