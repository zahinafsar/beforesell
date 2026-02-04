set -e

ITERATIONS=${1:-10}

echo "Starting Ralph loop with $ITERATIONS iterations..."
echo "============================================"

for i in $(seq 1 $ITERATIONS); do
    echo ""
    echo "=== Ralph Loop Iteration $i of $ITERATIONS ==="
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    claude --dangerously-skip-permissions --print "Read plans/prd.json and find the first feature where passes is false.

    Implement ONLY that feature.

    Then run these commands in order:
    1. npm test
    2. npm run lint
    3. npm run typecheck
    4. npm run build

    If ALL pass:
    1. Commit the changes with a descriptive message referencing the feature id
    2. Update plans/prd.json to set passes: true for this feature
    3. Append progress to memory.txt with timestamp

    If ANY fail:
    1. Read the error messages carefully
    2. Fix the issues
    3. Try again

    Exit when done with this ONE feature."

    echo ""
    echo "Completed iteration $i"
    sleep 2
done

echo ""
echo "============================================"
echo "Ralph loop complete!"
echo "Check progress.txt for results."