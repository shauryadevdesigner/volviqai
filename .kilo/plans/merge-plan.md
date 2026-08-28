# Plan: Merge Local Changes with Teammate's Remote Changes

## Situation
- You have local uncommitted changes (the Ad mode improvements)
- Your teammate pushed changes to GitHub (origin/main)
- You need to merge both without losing either person's work

## Safely Merge (Execute these commands in order)

### Step 1: Stash your local changes
```bash
cd C:\Users\ziada\Downloads\volviqai-pipeline-fixes\volviq
git stash push -m "Ad mode improvements - style variations + enhanceCode"
```

### Step 2: Pull teammate's changes from GitHub
```bash
git pull origin main
```

### Step 3: Re-apply your stashed changes
```bash
git stash pop
```

### Step 4: If there are merge conflicts
Git will tell you which files have conflicts. Common conflict files might be:
- `src/ai/orchestrator/stages/stage8-engineer.ts`
- `src/lib/generation-mode.ts`
- `src/ai/prompts/generation.ts`

For each conflicted file:
1. Open the file in your editor
2. Look for `<<<<<<< HEAD`, `=======`, `>>>>>>>` markers
3. Keep BOTH your teammate's changes AND your changes
4. Remove the conflict markers
5. Save the file

### Step 5: Stage and commit the merged result
```bash
git add .
git commit -m "Merge: Ad mode improvements + teammate's changes"
```

### Step 6: Push to GitHub
```bash
git push origin main
```

## Risk Mitigation
- `git stash` safely stores your changes — they won't be lost
- If the merge goes wrong, you can always `git stash pop` to get your changes back
- If you need to abort: `git merge --abort` then `git stash pop`

## After Merge
- Run `npx tsc --noEmit` to verify no type errors
- Test Ad generation to confirm both your improvements and teammate's changes work
