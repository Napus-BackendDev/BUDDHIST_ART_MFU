"""Convert current TOR screenshots to web-sized JPEGs."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "tor" / "captures-v2"
TARGET = ROOT / "docs" / "tor" / "optimized"
MAX_WIDTH = 1500


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    converted = 0
    for source in sorted(SOURCE.glob("*.png")):
        target = TARGET / f"{source.stem}.jpg"
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            if image.width > MAX_WIDTH:
                height = round(image.height * MAX_WIDTH / image.width)
                image = image.resize((MAX_WIDTH, height), Image.Resampling.LANCZOS)
            image.save(target, "JPEG", quality=84, optimize=True, progressive=True)
        converted += 1
        print(f"converted {target.relative_to(ROOT)}")
    print(f"converted {converted} screenshot(s)")


if __name__ == "__main__":
    main()
