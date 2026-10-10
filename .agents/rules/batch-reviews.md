---
name: batch-reviews
description: Automated process for batch changes
trigger: always_on
---

# Batch Review Process

When the user asks for a "batch" of changes (e.g., "batch 1", "batch 2") or submits a very large prompt with multiple changes:

1. Perform the requested changes as normal.
2. Create a folder named `reviews/batch<N>` (where `<N>` is the batch number).
3. If the changes involve UI modifications, take screenshots of the affected pages/components in both dark and light modes, and place them inside the `reviews/batch<N>/` folder.
4. Create a `reviews/batch<N>/CHANGES.md` document.
5. In `CHANGES.md`, document all the details related to the changes made in this batch clearly (e.g., bug fixes, structural changes, modified files, known limitations).
6. Inform the user in the final reply that the `reviews/batch<N>` folder has been created with the screenshots and the detailed `CHANGES.md`.
