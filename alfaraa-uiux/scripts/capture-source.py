"""Capture public WordPress material as inert data, never executable HTML."""
import json
import re
import time
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://alfaraaonline.com.sa"


def fetch(url):
    for attempt in range(3):
        try:
            with urlopen(Request(quote(url, safe=":/?#=&%"), headers={"User-Agent": "AlFaraa-DesignReview/1.0"}), timeout=35) as response:
                return response.read()
        except OSError:
            if attempt == 2:
                raise
            time.sleep(1)


class Content(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hidden = 0
        self.text = []
        self.images = []
        self.links = []
        self.frames = []
        self.counters = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag in ("script", "style", "head"):
            self.hidden += 1
        if self.hidden:
            return
        if tag in ("p", "h1", "h2", "h3", "h4", "h5", "li", "br", "div"):
            self.text.append("\n")
        if attrs.get("data-target", "").isdigit() and "counter" in attrs.get("class", "").split():
            self.counters.append(int(attrs["data-target"]))
        if tag == "img":
            src = attrs.get("data-src", attrs.get("src", ""))
            if src.startswith("https://"):
                self.images.append({"url": src.replace("www.alfaraaonline.com.sa", "alfaraaonline.com.sa"), "alt": attrs.get("alt", "")})
        if tag == "a" and attrs.get("href", "").startswith(("https://", "tel:", "mailto:")):
            self.links.append(unescape(attrs["href"]))
        if tag == "iframe":
            self.frames.append(attrs.get("data-src", attrs.get("src", "")))

    def handle_endtag(self, tag):
        if tag in ("script", "style", "head"):
            self.hidden = max(0, self.hidden - 1)
        if not self.hidden and tag in ("p", "h1", "h2", "h3", "h4", "li", "div"):
            self.text.append("\n")

    def handle_data(self, value):
        if not self.hidden:
            self.text.append(value)


def clean(item):
    parser = Content()
    parser.feed(item["content"]["rendered"])
    lines = [re.sub(r"\s+", " ", line).strip() for line in "".join(parser.text).splitlines()]
    # Inline backgrounds are company media too; keep them as inert image data.
    for url in re.findall(r"url\([\"']?(https://[^)\"']+)", item["content"]["rendered"]):
        if urlparse(url).hostname in ("alfaraaonline.com.sa", "www.alfaraaonline.com.sa"):
            parser.images.append({"url": unescape(url), "alt": "", "background": True})
    images = list({image["url"]: image for image in parser.images}.values())
    return {
        "id": item["id"], "slug": unquote(item["slug"]), "url": item["link"],
        "title": unescape(re.sub(r"<[^>]*>", "", item["title"]["rendered"])),
        "date": item.get("date", ""), "lines": [line for line in lines if line],
        "images": images, "links": list(dict.fromkeys(parser.links)), "frames": parser.frames, "counters": parser.counters,
    }


def collection(kind):
    items = []
    index = 1
    while True:
        batch = json.loads(fetch(BASE + f"/wp-json/wp/v2/{kind}?per_page=100&page={index}&_fields=id,slug,link,title,content,date"))
        items.extend(batch)
        if len(batch) < 100:
            return items
        index += 1


def capture():
    pages = collection("pages")
    posts = collection("posts")
    data = {"source": BASE, "capturedAt": datetime.now(timezone.utc).isoformat(), "pages": [clean(page) for page in pages if not (page["slug"] == "test" and not page["content"]["rendered"].strip())], "posts": [clean(post) for post in posts]}
    # Capture global navigation/social/form destinations outside WordPress page content.
    shell = Content()
    shell.feed(fetch(BASE + "/").decode("utf-8"))
    data["siteLinks"] = list(dict.fromkeys(shell.links))
    destination = ROOT / "dist"
    assets = destination / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    files = {
        "logo.png": BASE + "/wp-content/uploads/2021/04/1-6-scaled.png",
        "logo.jpg": BASE + "/wp-content/uploads/2021/04/1-6-scaled.png",
        "logo-emblem.png": BASE + "/wp-content/uploads/2025/07/%D8%A7%D9%84%D9%81%D8%A7%D8%B1%D8%B9_22-removebg-preview.png",
        "logistics.png": BASE + "/wp-content/uploads/2021/04/Global-Logistics_-Air-Road-and-Sea.png",
        "equipment.jpeg": BASE + "/wp-content/uploads/2025/07/b66175d7-3e79-4bd8-891e-a96307adca13.jpeg",
    }
    for filename, url in files.items():
        if not (assets / filename).exists():
            (assets / filename).write_bytes(fetch(url))
    (destination / "source.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    assert data["pages"], "Corporate pages must be retained"
    assert data["posts"], "News content must be retained"
    assert all(urlparse(page["url"]).hostname == "alfaraaonline.com.sa" for page in data["pages"])
    print(f"Captured {len(data['pages'])} public pages and {len(data['posts'])} news articles; downloaded {len(files)} identity assets.")
    for page in data["pages"]:
        print(page["slug"], "|", " / ".join(page["lines"][:9]), "|", len(page["images"]), "images", "|", page["frames"])


if __name__ == "__main__":
    capture()
