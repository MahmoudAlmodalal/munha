"""Cache every company page/article image without changing the source artwork."""
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlparse
from importlib.util import module_from_spec, spec_from_file_location

spec = spec_from_file_location("capture", Path(__file__).with_name("capture-source.py"))
capture = module_from_spec(spec)
spec.loader.exec_module(capture)
root = Path(__file__).resolve().parents[1] / "dist"
data = json.loads((root / "source.json").read_text())
jobs = {}
for item in data["pages"] + data["posts"]:
    for image in item["images"]:
        url = image["url"]
        suffix = Path(urlparse(url).path).suffix.lower() or ".png"
        local = image.get("local") or f"assets/source-{hashlib.sha256(url.encode()).hexdigest()[:16]}{suffix}"
        image["local"] = local
        jobs[url] = local
for post in data["posts"]:
    if post["images"]:
        post["thumbnail"] = post["images"][0]["local"]
home = next(page for page in data["pages"] if page["slug"] == "الرئيسيه")
data["brands"] = [image["local"] for image in home["images"]
                  if "removebg-preview" in image["url"] and "الفارع" not in image["url"]]
for flag in ["sa", "eg", "cn", "ae"]:
    jobs[f"https://flagcdn.com/w80/{flag}.png"] = f"assets/flag-{flag}.png"


def save(job):
    url, local = job
    destination = root / local
    if not destination.exists():
        payload = capture.fetch(url)
        temporary = destination.with_suffix(destination.suffix + ".tmp")
        temporary.write_bytes(payload)
        temporary.replace(destination)


with ThreadPoolExecutor(max_workers=6) as pool:
    list(pool.map(save, jobs.items()))
assert all((root / local).exists() for local in jobs.values())
(root / "source.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Cached {len(jobs)} source images, including every article gallery and all {len(data['brands'])} brand logos.")
