#!/bin/sh
# Stop hook: frontend/src に未コミットの変更があるとき、完了ゲート(prettier / lint / test)を通す。
# 失敗したら exit 2 で stderr をモデルに返し、修正を続けさせる。build は時間がかかるため対象外。

input=$(cat)
# hook の差し戻しで継続中なら、無限ループを避けて止める
case "$input" in *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;; esac

root=${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}
cd "$root" || exit 0

changed=$(
    { git diff --name-only HEAD -- frontend/src; git ls-files --others --exclude-standard -- frontend/src; } |
        sort -u | while read -r f; do [ -f "$f" ] && echo "$f"; done
)
[ -z "$changed" ] && exit 0

# 前回ゲートを通過した時から変更内容が同じならスキップ
stamp="$(git rev-parse --absolute-git-dir)/claude-frontend-gate.ok"
hash=$(echo "$changed" | xargs cat | git hash-object --stdin)
[ -f "$stamp" ] && [ "$(cat "$stamp")" = "$hash" ] && exit 0

cd frontend || exit 0
rel=$(echo "$changed" | sed 's#^frontend/##' | grep -E '\.(ts|tsx)$')

fail() {
    echo "完了ゲート失敗: $1" >&2
    echo "$2" | tail -40 >&2
    exit 2
}

if [ -n "$rel" ]; then
    out=$(echo "$rel" | xargs npx prettier --check 2>&1) || fail "prettier --check" "$out"
fi
# 既存 warning で出力が埋もれないよう error のみ表示(終了コードは通常の lint と同じ)
out=$(npm run lint -- --quiet 2>&1) || fail "npm run lint" "$out"
out=$(npm test 2>&1) || fail "npm test" "$out"

echo "$hash" > "$stamp"
exit 0
