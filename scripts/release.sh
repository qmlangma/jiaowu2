#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

COMMIT_MESSAGE="${1:-发布更新 $(date '+%Y-%m-%d %H:%M')}"
BRANCH="$(git branch --show-current)"

if [[ -z "$BRANCH" ]]; then
  echo "发布失败：当前处于 detached HEAD，请先切换到一个分支。" >&2
  exit 1
fi

echo "[1/4] 构建项目"
npm run build

echo "[2/4] 保存代码"
# 排除 Word/Office 临时锁文件和 macOS 元数据文件。
git add -A -- . ':(exclude)docs/.~*' ':(exclude)**/.DS_Store'
if git diff --cached --quiet; then
  echo "没有需要提交的代码变更。"
else
  git commit -m "$COMMIT_MESSAGE"
fi

echo "[3/4] 推送 GitHub：$BRANCH"
git push -u origin "$BRANCH"

echo "[4/4] 部署 Vercel 生产环境"
npx --yes vercel --prod --yes

echo "发布完成。"
