# Remove AI code slop

Check the diff against the last commit, and remove all AI generated slop introduced in this branch.

This includes:

- Self-evident comments that a human wouldn't add or is inconsistent with the rest of the file
    - Verbose comments explaining tricky code **MUST** be preserved
    - JSDoc comments **MUST** be preserved
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted / validated codepaths)
- Any other style that is inconsistent with the file

Report at the end with only a 1-3 sentence summary of what you changed
