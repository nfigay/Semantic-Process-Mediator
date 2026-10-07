#!/bin/zsh

# BPMNSM synchronized six-target publication
# No set -e by project convention. Every gate reports its RC and stops via return.

bpmnsm_fail() {
  echo "PUBLICATION=FAILED"
  echo "REASON=$1"
  return 1
}

bpmnsm_publish_six() {
  local ROOT="${BPMNSM_ROOT:-$HOME/git/Semantic-Process-Mediator}"
  local DOWNLOADS="$HOME/Downloads"
  local EXPECTED_BRANCH="main"
  local SOURCE_COMMIT ORIGIN_MAIN GH_PAGES_COMMIT
  local TEST_RC BUILD_RC PUSH_RC FETCH_RC DEPLOY_RC VERIFY_RC
  local STATUS
  local MANIFEST

  echo "===== BPMNSM SYNCHRONIZED SIX-TARGET PUBLICATION ====="
  date
  echo "ROOT=$ROOT"

  cd "$ROOT" || { bpmnsm_fail "repository not found"; return 1; }

  echo
  echo "===== 1. SOURCE GUARD ====="
  local BRANCH="$(git branch --show-current 2>/dev/null)"
  echo "BRANCH=$BRANCH"
  if [[ "$BRANCH" != "$EXPECTED_BRANCH" ]]; then
    bpmnsm_fail "publication requires branch main"
    return 1
  fi

  # .DS_Store is explicitly ignored by this publication gate.
  STATUS="$(git status --porcelain --untracked-files=all | /usr/bin/grep -v -E '^.. (.+/)?\.DS_Store$' || true)"
  if [[ -n "$STATUS" ]]; then
    echo "$STATUS"
    bpmnsm_fail "working tree contains source changes; commit the qualified source first"
    return 1
  fi
  echo "WORKTREE=OK"

  echo
  echo "===== 2. SOURCE REMOTE ALIGNMENT ====="
  git fetch origin main
  FETCH_RC=$?
  echo "FETCH_MAIN_RC=$FETCH_RC"
  if (( FETCH_RC != 0 )); then
    bpmnsm_fail "cannot fetch origin/main"
    return 1
  fi

  SOURCE_COMMIT="$(git rev-parse HEAD 2>/dev/null)"
  ORIGIN_MAIN="$(git rev-parse origin/main 2>/dev/null)"
  echo "HEAD=$SOURCE_COMMIT"
  echo "ORIGIN_MAIN=$ORIGIN_MAIN"

  if [[ "$SOURCE_COMMIT" != "$ORIGIN_MAIN" ]]; then
    echo "Pushing exact source commit to origin/main..."
    git push origin main
    PUSH_RC=$?
    echo "PUSH_MAIN_RC=$PUSH_RC"
    if (( PUSH_RC != 0 )); then
      bpmnsm_fail "source push failed"
      return 1
    fi
    git fetch origin main
    FETCH_RC=$?
    ORIGIN_MAIN="$(git rev-parse origin/main 2>/dev/null)"
    echo "REFETCH_MAIN_RC=$FETCH_RC"
    echo "ORIGIN_MAIN=$ORIGIN_MAIN"
    if (( FETCH_RC != 0 )) || [[ "$SOURCE_COMMIT" != "$ORIGIN_MAIN" ]]; then
      bpmnsm_fail "origin/main is not the exact source commit"
      return 1
    fi
  fi
  echo "SOURCE_REMOTE_ALIGNMENT=OK"

  echo
  echo "===== 3. TESTS ====="
  npm test -- --run
  TEST_RC=$?
  echo "TEST_RC=$TEST_RC"
  if (( TEST_RC != 0 )); then
    bpmnsm_fail "tests failed"
    return 1
  fi

  echo
  echo "===== 4. BUILD ALL SIX TARGETS ====="
  npm run build
  BUILD_RC=$?
  echo "BUILD_RC=$BUILD_RC"
  if (( BUILD_RC != 0 )); then
    bpmnsm_fail "build failed"
    return 1
  fi

  echo
  echo "===== 5. SIX TARGET GUARD ====="
  local TARGETS=(
    "dist/standalone/coc-bpmn-editor.html"
    "dist/standalone/coc-bpmn-viewer.html"
    "dist/server/publisher/publisher.html"
    "dist/server/viewer/viewer.html"
    "dist/modules/publisher/publisher.html"
    "dist/modules/viewer/viewer.html"
  )
  VERIFY_RC=0
  for f in "${TARGETS[@]}"; do
    if [[ -f "$f" ]]; then
      echo "OK      $f"
    else
      echo "MISSING $f"
      VERIFY_RC=1
    fi
  done
  echo "SIX_TARGET_RC=$VERIFY_RC"
  if (( VERIFY_RC != 0 )); then
    bpmnsm_fail "one or more deployment targets are missing"
    return 1
  fi

  echo
  echo "===== 6. GITHUB PAGES / PRESERVED MODULE GUARD ====="
  VERIFY_RC=0
  if [[ -f dist/.nojekyll ]]; then
    echo "NOJEKYLL=OK"
  else
    echo "NOJEKYLL=MISSING"
    VERIFY_RC=1
  fi

  local MODULE_FILES=(
    "dist/modules/publisher/modules/_virtual/_vite/modulepreload-polyfill.js"
    "dist/modules/publisher/modules/_virtual/_rolldown/runtime.js"
    "dist/modules/viewer/modules/_virtual/_vite/modulepreload-polyfill.js"
    "dist/modules/viewer/modules/_virtual/_rolldown/runtime.js"
  )
  for f in "${MODULE_FILES[@]}"; do
    if [[ -f "$f" ]]; then
      echo "OK      $f"
    else
      echo "MISSING $f"
      VERIFY_RC=1
    fi
  done

  local PUB_MAP_COUNT VIEW_MAP_COUNT
  PUB_MAP_COUNT="$(find dist/modules/publisher -type f -name '*.map' 2>/dev/null | wc -l | tr -d ' ')"
  VIEW_MAP_COUNT="$(find dist/modules/viewer -type f -name '*.map' 2>/dev/null | wc -l | tr -d ' ')"
  echo "publisher MAP_COUNT=$PUB_MAP_COUNT"
  echo "viewer MAP_COUNT=$VIEW_MAP_COUNT"
  if (( PUB_MAP_COUNT == 0 || VIEW_MAP_COUNT == 0 )); then
    VERIFY_RC=1
  fi
  echo "MODULE_GUARD_RC=$VERIFY_RC"
  if (( VERIFY_RC != 0 )); then
    bpmnsm_fail "GitHub Pages preserved-module requirements failed"
    return 1
  fi

  echo
  echo "===== 7. PUBLICATION PROVENANCE ====="
  cat > dist/BPMNSM_PUBLICATION.txt <<EOF
BPMNSM GitHub Pages publication
source_commit=$SOURCE_COMMIT
source_branch=main
source_remote=origin/main
deployment_count=6
EOF
  cat dist/BPMNSM_PUBLICATION.txt

  MANIFEST="$DOWNLOADS/BPMNSM_DIST_SHA256_${SOURCE_COMMIT[1,8]}.txt"
  (
    cd dist || return
    find . -type f -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256
  ) > "$MANIFEST"
  echo "DIST_MANIFEST=$MANIFEST"
  shasum -a 256 "$MANIFEST"

  echo
  echo "===== 8. FINAL SOURCE GUARD ====="
  git fetch origin main
  FETCH_RC=$?
  ORIGIN_MAIN="$(git rev-parse origin/main 2>/dev/null)"
  echo "FETCH_MAIN_RC=$FETCH_RC"
  echo "HEAD=$SOURCE_COMMIT"
  echo "ORIGIN_MAIN=$ORIGIN_MAIN"
  if (( FETCH_RC != 0 )) || [[ "$SOURCE_COMMIT" != "$ORIGIN_MAIN" ]]; then
    bpmnsm_fail "source changed or is not synchronized before deployment"
    return 1
  fi
  echo "FINAL_SOURCE_GUARD=OK"

  echo
  echo "===== 9. DEPLOY EXACT DIST TO GH-PAGES ====="
  npx gh-pages -d dist --dotfiles
  DEPLOY_RC=$?
  echo "DEPLOY_RC=$DEPLOY_RC"
  if (( DEPLOY_RC != 0 )); then
    bpmnsm_fail "gh-pages deployment failed"
    return 1
  fi

  echo
  echo "===== 10. REMOTE ALIGNMENT ====="
  git fetch origin main gh-pages
  FETCH_RC=$?
  ORIGIN_MAIN="$(git rev-parse origin/main 2>/dev/null)"
  GH_PAGES_COMMIT="$(git rev-parse origin/gh-pages 2>/dev/null)"
  echo "FINAL_FETCH_RC=$FETCH_RC"
  echo "SOURCE_COMMIT=$SOURCE_COMMIT"
  echo "ORIGIN_MAIN=$ORIGIN_MAIN"
  echo "ORIGIN_GH_PAGES=$GH_PAGES_COMMIT"

  if (( FETCH_RC != 0 )) || [[ "$SOURCE_COMMIT" != "$ORIGIN_MAIN" ]]; then
    bpmnsm_fail "remote source/publication alignment failed"
    return 1
  fi
  echo "SOURCE_PUBLICATION_ALIGNMENT=OK"

  echo
  echo "===== 11. REMOTE SIX-URL HTTP CHECK ====="
  local BASE="https://nfigay.github.io/Semantic-Process-Mediator"
  local URLS=(
    "$BASE/standalone/coc-bpmn-editor.html"
    "$BASE/standalone/coc-bpmn-viewer.html"
    "$BASE/server/publisher/publisher.html"
    "$BASE/server/viewer/viewer.html"
    "$BASE/modules/publisher/publisher.html"
    "$BASE/modules/viewer/viewer.html"
  )
  VERIFY_RC=0
  for url in "${URLS[@]}"; do
    local CODE=""
    local TRY=1
    while (( TRY <= 6 )); do
      CODE="$(curl -L -sS -o /dev/null -w '%{http_code}' "$url")"
      [[ "$CODE" == "200" ]] && break
      sleep 5
      (( TRY++ ))
    done
    echo "$CODE $url"
    [[ "$CODE" == "200" ]] || VERIFY_RC=1
  done
  echo "REMOTE_URL_RC=$VERIFY_RC"
  if (( VERIFY_RC != 0 )); then
    bpmnsm_fail "one or more GitHub Pages targets are not reachable"
    return 1
  fi

  echo
  echo "PUBLICATION=OK"
  echo "SOURCE_COMMIT=$SOURCE_COMMIT"
  echo "GH_PAGES_COMMIT=$GH_PAGES_COMMIT"
  return 0
}

bpmnsm_publish_six
