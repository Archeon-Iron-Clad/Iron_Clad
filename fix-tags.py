from pathlib import Path

# Fix mistaken JSX tag name (mo+tion) -> div
OPEN_BAD = "<" + "mo" + "tion"
OPEN_GOOD = "<div"
CLOSE_BAD = "</" + "mo" + "tion>"
CLOSE_GOOD = "</" + "div" + ">"

for p in Path("src").rglob("*.tsx"):
    t = p.read_text(encoding="utf-8")
    n = t.replace(CLOSE_BAD, CLOSE_GOOD).replace(OPEN_BAD, OPEN_GOOD)
    if n != t:
        p.write_text(n, encoding="utf-8")
        print("fixed", p)
