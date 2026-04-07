import subprocess, sys

result = subprocess.run(
    [sys.executable, "-m", "pytest", "tests/", "-v", "--tb=long", "-p", "no:cacheprovider"],
    capture_output=True,
    text=True,
    cwd="."
)
output = result.stdout + "\n" + result.stderr
print(output)
with open("test_results.txt", "w", encoding="utf-8") as f:
    f.write(output)
print("Exit code:", result.returncode)
