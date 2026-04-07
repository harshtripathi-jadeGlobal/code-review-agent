import subprocess
result = subprocess.run(["npx.cmd", "vitest", "run"], capture_output=True, text=True)
print("STDOUT-START")
print(result.stdout)
print("STDOUT-END")
print("STDERR-START")
print(result.stderr)
print("STDERR-END")
