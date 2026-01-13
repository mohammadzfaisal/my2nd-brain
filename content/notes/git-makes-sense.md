---
title: "Git Makes Sense"
date: "2026-01-11T11:02:58Z"
category: "learning"
isFavorite: true
status: "active"
tags: ["Git"]
---

# A Guide to the Core Concepts

### Introduction: From Fear to Fluency

Many developers use Git every day through a set of memorized commands: `commit`, `push`, `pull`. It works perfectly, until it doesn't. Suddenly, you've made a mistake with a `rebase` or a `reset`, and you find yourself googling how to undo a `rebase` at 11 p.m., copying commands from Stack Overflow, praying you don't make the situation worse. This experience is common, but it doesn't have to be your reality.

The goal of this guide is to build a solid mental model of how Git actually works. Instead of just memorizing commands, you will understand the fundamental building blocks from the ground up. By the end, you'll see that Git can make perfect sense, and you can stop fearing it for good.

![The Commit](https://cdn.sanity.io/images/mvggkjnh/production/dd4ad8a43f9fd1443ccbd6f9cf2f92117f1ba3c2-2816x1536.png)

### 1. The Foundation of Git: The Commit as a Snapshot

To begin, forget everything you think you know. Git is, at its core, a database, and the most fundamental unit of that database is the **commit**. So, what exactly is a commit?



A **commit** is a snapshot, a complete photograph of your entire project at one moment in time. It's not the *changes* you made; it's the *entire state* of every file.

Every single commit contains three essential components:

1. **A pointer to the complete snapshot** of all your project files as they existed at that exact moment.
2. **Metadata**, which includes the author, the timestamp, and the descriptive commit message you wrote.
3. **A pointer to the parent commit**—the commit that came directly before it.

This parent-pointer system is the key to Git's power. When you make a new commit, Git saves the full state of your project and creates a link back to the commit you were just on. This creates a backward-linking chain of history. Each child commit knows its parent, but a parent commit never knows about the future children that will point to it. The very first commit in a project is special; it's the origin point and has no parent.

Later, you'll encounter *merge commits*, which are special because they have two parents, joining two different lines of work.

![The Dag](https://cdn.sanity.io/images/mvggkjnh/production/9ccd0f459b69b8ef78fea333e8db7f55d9057b1a-2816x1536.png)

This structure of commits and pointers forms a graph. The official name for this structure is a **Directed Acyclic Graph (DAG)**, which isn't as intimidating as it sounds. Think of it like a family tree:

- **Directed**: Relationships only go one way (children point to parents).
- **Acyclic**: There are no loops (you cannot be your own grandparent).
- **Graph**: It's a collection of nodes (commits) and the connections between them.

This graph is your project’s entire history. But a raw graph can be complex. How do we navigate it and label the points that matter? That's where branches come in.

### 2. Navigating the Graph: Branches and HEAD

![Pointer & Layers](https://cdn.sanity.io/images/mvggkjnh/production/eb4c8f66e86431890241aed3b3edd42a7ececb4e-2816x1536.png)

A common misconception is that branches are heavy, complex copies of your codebase. This is completely wrong.

A branch is just a **sticky note**. It's a simple, lightweight pointer—a tiny text file that contains a single piece of information: the hash (the unique ID) of a specific commit. That's it. When you create a new branch, you aren't copying your project; you're just adding a new sticky note pointing to your current commit. This is why creating a branch is instantaneous.

When you make a new commit while on a branch, two things happen: Git creates the new commit (which points to its parent), and then it simply moves the branch's "sticky note" forward to this new commit.

Even `main` isn't special. It's just another sticky note that, by convention, we agree to use as the primary line of work.

So if branches are just pointers, how does Git know where *you* are currently working? That's the job of **`HEAD`**. `HEAD` is Git's way of tracking your current location. It's another pointer that usually points to a branch. For example, when you're on the `main` branch, the chain looks like this: `HEAD` -> `main` -> `commit`.

When you run `git checkout [branch-name]`, all you are doing is moving the `HEAD` pointer to point at that new branch.

This leads to a special situation called a **"detached HEAD state."** This happens when you check out a specific commit hash instead of a branch. In this state, `HEAD` points directly to a commit, with no branch in between. You can look around and even make new commits, but since no branch is following along, those new commits are "orphaned." A developer might check out an old commit to test something, find a bug, quickly fix it, and commit the fix. Then, they run `git checkout main`, only to find their fix has vanished. Because it was made in a detached HEAD state, no branch was tracking it, and it was eventually deleted by Git's garbage collection process—two hours of work, gone.

These pointers manage the permanent history in the repository. But before a change becomes a permanent commit, where does it actually live? To understand how Git undoes things, we need to look at three distinct areas.

### 3. The Three Areas: Where Your Code Lives

![Undoing & Integration](https://cdn.sanity.io/images/mvggkjnh/production/49d61182d33d9a2d39122d559e62d6daee021521-2816x1536.png)

To understand how Git commands undo or modify work, you must first know the three distinct areas where your code can exist at any given time.

1. **Working Directory**: These are the actual files on your computer's disk. It's what you see in your code editor and what you can directly edit.
2. **The Staging Area (or Index)**: Think of this as a "waiting room" or a draft space. It's where you prepare and group a set of changes that you want to include in your next commit.
3. **The Repository**: This is the `.git` database itself, which contains the permanent, unchangeable history of all your project's commits (the graph we discussed).

The standard workflow moves code through these three areas in sequence:

- You modify a file in your **Working Directory**.
- You use `git add` to place the changes you've made into the **Staging Area**, marking them for inclusion in the next commit.
- You use `git commit` to take everything in the **Staging Area** and create a permanent, new snapshot (a commit) in the **Repository**.

So, how do Git's powerful (and often confusing) commands interact with these three areas to modify your project's history?

### 4. Modifying History: `checkout`, `reset`, `revert`, and `rebase`

The following four commands are often confused, but they perform very different operations on the Git graph and the three areas where your code lives.

4.1. `git checkout`: Moving Your Viewpoint

The primary job of `git checkout` is to move the `HEAD` pointer. It's a safe, non-destructive command used for "looking around" in your project's history. When you check out a branch or a commit, Git updates your working directory to match that snapshot. History itself is completely untouched; you're just changing your point of view.

4.2. `git reset`: Moving a Branch (With Caution!)

The primary job of `git reset` is to move the *branch pointer* that `HEAD` is currently pointing to. This can be a dangerous command because by moving a branch pointer backward, you can "orphan" commits, making them seem as though they've disappeared from your history.

![git reset modes](https://cdn.sanity.io/images/mvggkjnh/production/84d4cd4f9aa694877203407822b09b4d0470fbf8-688x296.jpg)

Be extremely careful with `git reset --hard`. While the orphaned commits can often be recovered with `reflog`, any uncommitted changes in your working directory and staging area are gone forever. This is a critical distinction.

4.3. `git revert`: Creating Counter-History

`git revert` follows a completely different philosophy: it doesn't move or delete anything. Instead, `git revert` creates a **brand new commit** that does the exact opposite of a previous commit. If an old commit added 50 lines of code, reverting it will create a new commit that removes those same 50 lines.

This is the safe and correct way to undo a change that has already been pushed and shared with other developers, because it preserves the project history rather than rewriting it.

4.4. `git rebase`: Re-writing Local History

Let's imagine you created a feature branch from `main` with commits `B` and `C`. In the time you were working, `main` moved forward with commits `X` and `Y`. To integrate your work, you could `merge`, but `rebase` offers another option: to replay your branch's commits on top of the latest version of `main`.

You must understand this: Git cannot "move" commits. A commit's identity (its hash) is derived from its content, metadata, *and its parent*. If you change the parent, you get a brand new commit with a new hash. So, `rebase` works by creating new commits. It looks at your commit `B`, calculates the change it introduced, and creates a new commit `B1` with those same changes but with `Y` as its parent. It then does the same for `C`, creating a new commit `C1` on top of `B1`. Finally, it moves your branch pointer to `C1`. The original `B` and `C` are orphaned and eventually discarded.

A critical warning follows from this: **Never rebase commits that have been pushed and shared with others.** If a colleague has the old commits and you push the new rebased ones, Git will see them as completely unrelated work, leading to severe conflicts and duplicated changes. The trade-off of rebase is that you get a cleaner, more linear history at the cost of rewriting the "messy truth" of how development actually happened.

![git command summary](https://cdn.sanity.io/images/mvggkjnh/production/8acc43d60de742753a8bf4c0214ec0586d618084-688x318.jpg)

So, what happens when you make a mistake with a risky command? Fortunately, Git has an ultimate safety net.

### 5. The Safety Net: Never Lose Work with `git reflog`

If you've ever run a `reset --hard` by mistake or botched a `rebase` and think you've lost commits forever, `git reflog` is your best friend.

The reflog is a private record of everywhere `HEAD` has pointed recently. Every time you switch branches, make a commit, or perform a `reset`, Git logs that movement. If you've lost work, you can run `git reflog` to find the commit hash of where you were *before* the mistake. Once you have that hash, you can simply create a new branch pointing to it (`git checkout -b recovered-work [hash]`) and your work is restored.

The only caveat is that reflog entries do expire (typically after 30 days for unreachable commits and 90 days for reachable ones), but it is a reliable tool for fixing any recent disaster.

### Thinking in Graphs

By stripping away the complexity, we arrive at a simple and powerful mental model for Git.

- Git is a database of project **snapshots** called commits.
- Commits point to their parents, forming a **graph** of your project's history.
- **Branches** and **`HEAD`** are just lightweight **pointers** that let you navigate and label points in that graph.

The next time something breaks in Git, you won't be copying Stack Overflow commands and praying. Instead, you'll be able to **think in graphs and pointers**, diagnose exactly what happened, and confidently choose the right command to fix it.

### ****
