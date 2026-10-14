"""Cache the source site's news and brand images for a reliable preview."""
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
jobs = []
for post in data["posts"]:
    if post["images"]:
        url = post["images"][0]["url"]
        suffix = Path(urlparse(url).path).suffix or ".jpg"
        local = f"assets/news-{post['id']}{suffix}"
        post["thumbnail"] = local
        jobs.append((url, local))
home = next(page for page in data["pages"] if page["slug"] == "الرئيسيه")
data["brands"] = []
for index, image in enumerate(home["images"]):
    if "removebg-preview" in image["url"] and "الفارع" not in image["url"]:
        local = f"assets/brand-{index}.png"
        data["brands"].append(local)
        jobs.append((image["url"], local))
for page in data["pages"]:
    if page["slug"] in ["refund_returns", "organizational-chart", "banks"]:
        for index, image in enumerate(page["images"]):
            suffix = Path(urlparse(image["url"]).path).suffix or ".png"
            image["local"] = f"assets/document-{page['id']}-{index}{suffix}"
            jobs.append((image["url"], image["local"]))
for flag in ["sa", "eg", "cn", "ae"]:
    jobs.append((f"https://flagcdn.com/w80/{flag}.png", f"assets/flag-{flag}.png"))


def save(job):
    url, local = job
    destination = root / local
    if not destination.exists():
        destination.write_bytes(capture.fetch(url))


with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(save, jobs))
(root / "source.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
assert all((root / local).exists() for _, local in jobs)
print(f"Cached {len(jobs)} original company images without alteration.")
