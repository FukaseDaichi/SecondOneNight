# ゲーム別設計書

このディレクトリは、ゲームごとの backend / frontend / 状態 / 通信 status をまとめる。

| ゲーム | 設計書 | topic | 主要 frontend | 主要 backend |
| --- | --- | --- | --- | --- |
| timebomb | [timebomb.md](timebomb.md) | `/topic/{roomId}/timebomb` | `features/timebomb` | `TimeBombController`, `TimeBombRoom` |
| werewolf | [werewolf.md](werewolf.md) | `/topic/{roomId}` | `features/werewolf` | `WereWolfController`, `WerewolfRoom` |
| hideout | [hideout.md](hideout.md) | `/topic/{roomId}` | `features/hideout` | `HideoutController`, `HideoutRoom` |
| decrypt | [decrypt.md](decrypt.md) | `/topic/{roomId}` | `features/decrypt` | `DecryptController`, `DecryptRoom` |
| fakeartist | [fakeartist.md](fakeartist.md) | `/topic/{roomId}` | `features/fakeartist` | `FakeArtistController`, `FakeArtistRoom` |

## 読み方

- 「実装ファイル」で frontend と backend の対応を見る。
- 「状態モデル」で backend Room と frontend reducer state の対応を見る。
- 「通信」で `/app/*` destination と reducer status の対応を見る。
- 「状態遷移」でゲーム進行の大枠を見る。
- 「注意点」で互換性維持が必要な癖を見る。

新しいゲーム別設計書を作る場合は [_template.md](_template.md) をコピーして使う。

