# セカンドワンナイト人狼 紹介動画(9:16)

LP / SNS 向けの縦長紹介動画を作るための台本・スクリプト・素材を置く。動画本体は claude.ai の **Motion** Artifact で作り、ナレーションは **Gemini 3.8 Flash TTS**、合成は **ffmpeg** で行う。

- Motion フィルム: https://claude.ai/artifact/T7EjW9ZR13WUidvfopkMxF(所有者のアカウントでのみ開ける)
- 最終成果物: `out/werewolf-promo-9x16.mp4`(Git 管理外。再生成手順は下記)
- 採用ロゴ: [logo/imagegen/README.md](logo/imagegen/README.md)(横組み `best-h.png`、縦積み `best-stack.png`)
- 採用した声: Gemini プリビルト音声 **Achernar**(`script.json` の `voice`)

## ディレクトリ

```
script.json        台本の正本(シーン id / ナレーション / 強調語 / 字幕チャンク / 話し方 style / 声)
lib/               純粋関数(env・script 検証・TTS リクエスト・WAV 長・タイムライン・ffmpeg 引数)
test/              node --test(npm test)
tts.mjs            シーン別ナレーション WAV を生成 → out/narration-<id>.wav, out/durations.json, out/narration-hash.json
font-subset.mjs    Motion 用の日本語フォント woff2 を script.json + font-extra-strings.txt から再生成 → out/fonts/
youtube-upload.mjs YouTube Data API で非公開アップロード+概要欄・タグ・サムネ設定(OAuth。詳細は下記)
youtube-meta.json  YouTube のタイトル・概要欄・タグ・公開設定の正本
timeline.mjs       WAV 実測長から各シーンの秒数と字幕秒を確定 → out/timeline.json
mux.mjs            Motion の Export に ナレーションを合成 → out/werewolf-promo-9x16.mp4
logo/imagegen/     ロゴ(Codex の imagegen 生成、背景透過 PNG、プロンプト記録)
.env               GEMINI_API_KEY=...(Git 管理外。.env.example 参照)
out/               生成物(Git 管理外)
```

## 再生成手順

1. `assets-work/promo/.env` に `GEMINI_API_KEY=...` を置く
2. ナレーション生成(既存 WAV は、台本・声・話し方が前回と同じならスキップ。変わったシーンは自動で作り直す。強制は `--force --scenes hook,title`)

```bash
node assets-work/promo/tts.mjs
```

3. 尺の確定(`--write-subtitles` は、字幕秒が未設定のシーンと、前回の推定後に台本が変わったシーンの字幕秒を推定して `script.json` に書く。手で直した秒は台本が変わらない限り保持される。85 秒超なら非ゼロ終了)

```bash
node assets-work/promo/timeline.mjs --write-subtitles
```

4. Motion フィルム側の `modules/scenes.json` の各 `dur` と、`modules/shared.js` 内の字幕データ(`window.SUB`)を `out/timeline.json` と `script.json` に合わせる。ナレーションの長さが変わったシーンだけでよい
5. フィルムのページで **Export**(MP4)し、`out/motion-export.mp4` に置く
6. 合成(映像より最後のナレーションが長いと非ゼロ終了)

```bash
node assets-work/promo/mux.mjs
```

テスト:

```bash
npm --prefix assets-work/promo test
```

## 制作上の決定(再生成で迷いやすいもの)

- **ナレーション先行で尺を決める。** Motion 側の秒数は `out/timeline.json` に従う(`dur = narrationOffset + ナレーション長 + tailPad`、既定 0.4 + 0.4 秒。フックだけ offset 1.6)
- **話し方の指示は本文に書かない。** Gemini 3.8 系は本文を字義どおり読むため、`speech_metadata.style` に入れる(`script.json` の `style`)
- **字幕はナレーション全文**を文単位で画面下(top 1330px、下端 1500px 以内)に出す。強調語は別物で、シーン中央に大きく出す
- **独裁者の能力は描かない。** 独裁は発動した瞬間にゲームが終わる能力で、暗殺と同じシーンに並べられない(`docs/architecture/games/werewolf.md`)
- **暗殺者は人狼陣営**なので、暗殺シーンに「※暗殺者は人狼陣営の役職です」を添える(人狼を撃つのが目的に見えないように)
- **Motion は音声アセットを受け付けない。** ナレーションは Export 後に ffmpeg で合成する。BGM は Motion 内で作曲し、合成時に 0.4 倍に下げる
- **日本語フォントは Motion の `fonts` スロット非対応。** Google Fonts の TTF を fonttools で「台本の全文字 + `font-extra-strings.txt` の UI 文字列 + かな + ASCII」にサブセットした woff2 をアセットとして登録している。台本や画面の文字を変えたら `node assets-work/promo/font-subset.mjs` で作り直し、Motion の assets を差し替える(未収録の文字はシステムフォントで表示される)
- **Export の解像度**は Motion 側の設定に依存する(2026-10-20 時点の Export は 720×1280)。設計上は 1080×1920
- イラスト素材(ノーコピーライトガール / fromtheasia.com)は動画利用・収益化が許諾されており、CTA 末尾にクレジットを 2 秒以上表示する

## スコープ外(残課題は `docs/roadmap.md`)

16:9 版、LP への埋め込み、SNS 投稿文・サムネイル、他ゲームの紹介動画。

## YouTube へのアップロード(非公開で上げて手動公開)

未審査の API プロジェクトからのアップロードは非公開ロックされるため、API ではメタデータ込みで非公開アップロードまで行い、公開は YouTube Studio で押す運用にしている。

1. Google Cloud でプロジェクトを作り、YouTube Data API v3 を有効化。OAuth クライアント ID(種類: デスクトップアプリ)を作成し、JSON を `assets-work/promo/.youtube-client.json` に置く(Git 管理外)
2. 初回のみ同意(ブラウザが開く。トークンは `.youtube-token.json` に保存、Git 管理外)

```bash
node assets-work/promo/youtube-upload.mjs --auth
```

3. メタデータの確認(送信内容を表示するだけ)

```bash
node assets-work/promo/youtube-upload.mjs --dry-run
```

4. アップロード(`--thumb` でサムネイル画像も設定)

```bash
node assets-work/promo/youtube-upload.mjs --video out/werewolf-promo-9x16.mp4 --thumb logo/imagegen/best-stack.png
```

完了すると動画 URL が表示される。YouTube Studio で内容を確認して公開する。

サムネイル設定だけ後からやり直す(クォータ超過などで失敗したとき。クォータは太平洋時間 0 時にリセット):

```bash
node assets-work/promo/youtube-upload.mjs --video-id <動画ID> --thumb thumbnail/best.jpg
```

初回アップロード(2026-10-20): https://www.youtube.com/watch?v=5tD1p3bUlzs(非公開)。サムネイルは `thumbnail/best.jpg`(imagegen 案 2)。
