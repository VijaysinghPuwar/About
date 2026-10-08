#!/usr/bin/env python3
"""
Import a pandoc-generated EPUB into the /books reader.

    python3 -I scripts/import-epub.py <slug> <path/to/book.epub>

Writes, for one book:

  public/books/<slug>/chapters/<id>.html   one sanitised fragment per chapter
  public/books/<slug>/media/*              figures (PNG re-encoded as WebP)
  public/books/<slug>/cover.webp           640px-wide cover for the shelf
  src/data/books.json                      the catalogue entry, merged in place

The reader renders the fragments with dangerouslySetInnerHTML, so this script
is the security boundary: only the tags and attributes in ALLOWED survive,
every link is rewritten or dropped, and nothing executable gets through. The
EPUB is treated as untrusted input even though it is our own.

Stdlib only, plus `cwebp` and `sips` (both on this Mac) for images. Run with
`-I` so nothing in the working directory can shadow a stdlib module.
"""
import html
import json
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOGUE = ROOT / "src" / "data" / "books.json"
WORDS_PER_MINUTE = 220

NS = {
    "opf": "http://www.idpf.org/2007/opf",
    "dc": "http://purl.org/dc/elements/1.1/",
    "x": "http://www.w3.org/1999/xhtml",
    "c": "urn:oasis:names:tc:opendocument:xmlns:container",
}

ALLOWED = {
    "section": {"id", "class"}, "div": {"id", "class"}, "span": {"id", "class"},
    "h1": {"id", "class"}, "h2": {"id", "class"}, "h3": {"id", "class"},
    "h4": {"id", "class"}, "h5": {"id", "class"}, "h6": {"id", "class"},
    "p": {"id", "class"}, "a": {"id", "class", "href"},
    "ul": {"class"}, "ol": {"class", "start", "type"}, "li": {"id", "class"},
    "strong": set(), "em": set(), "b": set(), "i": set(), "code": {"class"},
    "pre": {"class"}, "kbd": set(), "sup": set(), "sub": set(), "small": set(),
    "del": set(), "ins": set(), "br": set(), "hr": set(), "blockquote": {"class"},
    "table": {"class"}, "caption": set(), "thead": set(), "tbody": set(),
    "tfoot": set(), "tr": set(), "th": {"colspan", "rowspan", "class"},
    "td": {"colspan", "rowspan", "class"}, "colgroup": set(), "col": {"style"},
    "figure": {"id", "class"}, "figcaption": set(), "img": {"src", "alt"},
    "dl": set(), "dt": set(), "dd": set(), "aside": {"class"},
}
VOID = {"br", "hr", "img", "col"}
SAFE_CLASS = re.compile(r"^[A-Za-z0-9 _-]{1,80}$")
SAFE_ID = re.compile(r"^[A-Za-z0-9._:-]{1,160}$")
SAFE_COL_STYLE = re.compile(r"^width:\s*\d{1,3}(\.\d+)?%;?$")


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def text_of(el) -> str:
    return re.sub(r"\s+", " ", "".join(el.itertext())).strip()


def image_size(path: Path):
    data = path.read_bytes()
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", data[16:24])
    if path.suffix == ".svg":
        root = ET.fromstring(data)
        vb = root.get("viewBox")
        if vb:
            parts = [float(v) for v in re.split(r"[\s,]+", vb.strip())]
            return round(parts[2]), round(parts[3])
        w, h = root.get("width", ""), root.get("height", "")
        if w and h:
            return round(float(re.sub(r"[^\d.]", "", w))), round(float(re.sub(r"[^\d.]", "", h)))
    return None


class Book:
    def __init__(self, slug: str, epub: Path, work: Path):
        self.slug = slug
        self.work = work
        with zipfile.ZipFile(epub) as z:
            for name in z.namelist():
                # Zip-slip guard: refuse any member that would land outside `work`.
                target = (work / name).resolve()
                if not str(target).startswith(str(work.resolve())):
                    raise SystemExit(f"refusing unsafe path in epub: {name}")
            z.extractall(work)
        container = ET.parse(work / "META-INF" / "container.xml")
        opf_rel = container.find(".//c:rootfile", NS).get("full-path")
        self.opf_path = work / opf_rel
        self.base = self.opf_path.parent
        self.out = ROOT / "public" / "books" / slug
        self.media_map: dict[str, dict] = {}

    # ---- metadata -------------------------------------------------------
    def metadata(self):
        opf = ET.parse(self.opf_path).getroot()
        md = opf.find("opf:metadata", NS)
        titles = {t.get("id"): text_of(t) for t in md.findall("dc:title", NS)}
        kinds = {m.get("refines", "").lstrip("#"): m.text for m in md.findall("opf:meta", NS)
                 if m.get("property") == "title-type"}
        title = next((v for k, v in titles.items() if kinds.get(k) == "main"), None) or next(iter(titles.values()))
        subtitle = next((v for k, v in titles.items() if kinds.get(k) == "subtitle"), None)
        manifest = {i.get("id"): i for i in opf.find("opf:manifest", NS)}
        cover_id = next((m.get("content") for m in md.findall("opf:meta", NS) if m.get("name") == "cover"), None)
        spine = [manifest[r.get("idref")].get("href") for r in opf.find("opf:spine", NS)]
        return {
            "title": title,
            "subtitle": subtitle,
            "author": text_of(md.find("dc:creator", NS)) if md.find("dc:creator", NS) is not None else None,
            "date": text_of(md.find("dc:date", NS)) if md.find("dc:date", NS) is not None else None,
            "description": text_of(md.find("dc:description", NS)) if md.find("dc:description", NS) is not None else None,
            "subjects": [text_of(s) for s in md.findall("dc:subject", NS)],
            "cover": manifest[cover_id].get("href") if cover_id in manifest else None,
            "spine": spine,
        }

    # ---- media ----------------------------------------------------------
    def media(self, href_from_opf: str) -> dict:
        """Copy one image into public/, once. Returns {src, width, height}."""
        if href_from_opf in self.media_map:
            return self.media_map[href_from_opf]
        src = (self.base / href_from_opf).resolve()
        if not str(src).startswith(str(self.base.resolve())) or not src.is_file():
            return {}
        dest_dir = self.out / "media"
        dest_dir.mkdir(parents=True, exist_ok=True)
        size = image_size(src)
        if src.suffix.lower() == ".png":
            dest = dest_dir / (src.stem + ".webp")
            subprocess.run(["cwebp", "-quiet", "-q", "82", "-m", "6", str(src), "-o", str(dest)], check=True)
        elif src.suffix.lower() in {".svg", ".jpg", ".jpeg", ".webp", ".gif"}:
            dest = dest_dir / src.name
            shutil.copyfile(src, dest)
        else:
            return {}
        info = {"src": f"/books/{self.slug}/media/{dest.name}"}
        if size:
            info["width"], info["height"] = size
        self.media_map[href_from_opf] = info
        return info

    def cover(self, href: str):
        src = self.base / href
        dest = self.out / "cover.webp"
        self.out.mkdir(parents=True, exist_ok=True)
        subprocess.run(["cwebp", "-quiet", "-q", "84", "-m", "6", "-resize", "640", "0", str(src), "-o", str(dest)], check=True)
        w, h = image_size(src)
        return {"src": f"/books/{self.slug}/cover.webp", "width": 640, "height": round(640 * h / w)}

    # ---- chapters -------------------------------------------------------
    def render(self, el, chapter_href: str, chapter_ids: dict) -> str:
        tag = local(el.tag)
        inner = html.escape(el.text or "", quote=False)
        for child in el:
            inner += self.render(child, chapter_href, chapter_ids)
            inner += html.escape(child.tail or "", quote=False)
        if tag not in ALLOWED:
            # Unknown wrappers are unwrapped, not dropped, so their text survives.
            # Script, style and svg content is never prose: drop it whole.
            return "" if tag in {"script", "style", "svg", "math", "iframe", "object", "embed", "form", "input", "button"} else inner

        attrs: dict[str, str] = {}
        for k, v in el.attrib.items():
            name = local(k)
            if name not in ALLOWED[tag]:
                continue
            if name == "class":
                v = v.strip()
                if not SAFE_CLASS.match(v):
                    continue
            if name == "id" and not SAFE_ID.match(v):
                continue
            if name == "style" and not SAFE_COL_STYLE.match(v.strip()):
                continue
            if name in {"colspan", "rowspan", "start"} and not v.isdigit():
                continue
            attrs[name] = v

        if tag == "a" and not inner.strip():
            # pandoc's per-line anchors in code blocks: empty, but each one is
            # a tab stop. Forty of them in a listing is a keyboard trap.
            return ""

        if tag == "a":
            href = el.get("href", "")
            if re.match(r"^(https?:|mailto:)", href, re.I):
                attrs["href"] = href
                if not href.lower().startswith("mailto:"):
                    attrs["target"] = "_blank"
                    attrs["rel"] = "noopener noreferrer"
            elif href.startswith("#"):
                attrs["href"] = href
            elif href:
                path, _, frag = href.partition("#")
                target = (Path(chapter_href).parent / path).as_posix()
                target = re.sub(r"(^|/)[^/]+/\.\./", r"\1", target)
                cid = chapter_ids.get(Path(target).name)
                if cid:
                    attrs["href"] = f"/books/{self.slug}/read/{cid}" + (f"#{frag}" if frag else "")
                else:
                    attrs.pop("href", None)
            else:
                attrs.pop("href", None)

        if tag == "img":
            rel = (Path(chapter_href).parent / el.get("src", "")).as_posix()
            rel = re.sub(r"(^|/)[^/]+/\.\./", r"\1", rel)
            info = self.media(rel)
            if not info:
                return ""
            attrs = {"src": info["src"], "alt": el.get("alt", "")}
            if "width" in info:
                attrs["width"], attrs["height"] = str(info["width"]), str(info["height"])
            attrs["loading"] = "lazy"
            attrs["decoding"] = "async"

        attr_str = "".join(f' {k}="{html.escape(v, quote=True)}"' for k, v in attrs.items())
        if tag in VOID:
            return f"<{tag}{attr_str}>"
        out = f"<{tag}{attr_str}>{inner}</{tag}>"
        if tag == "table":
            # Wide tables scroll inside their own box instead of the page.
            out = f'<div class="table-scroll" tabindex="0">{out}</div>'
        return out

    def build(self):
        meta = self.metadata()
        if self.out.exists():
            shutil.rmtree(self.out)
        (self.out / "chapters").mkdir(parents=True)

        docs = [h for h in meta["spine"] if not re.search(r"(cover|title_page|nav)\.xhtml$", h)]
        chapter_ids = {Path(h).name: Path(h).stem for h in docs}

        chapters, part = [], None
        for href in docs:
            root = ET.parse(self.base / href).getroot()
            body = root.find("x:body", NS)
            h1 = body.find(".//x:h1", NS)
            title_el = h1
            number = None
            if h1 is not None:
                num = h1.find("x:span[@class='header-section-number']", NS)
                number = text_of(num) if num is not None else None
            title = text_of(title_el) if title_el is not None else Path(href).stem
            if number and title.startswith(number):
                title = title[len(number):].strip()

            classes = (h1.get("class") or "") if h1 is not None else ""
            words = len(re.findall(r"\w+", text_of(body)))
            if "part" in classes.split() and words < 40:
                # Part dividers are a heading and nothing else. They become a
                # group label in the contents, not a page to turn through.
                part = title
                continue

            # Appendices follow the last part divider in the spine but are not
            # part of it; they get a group of their own.
            if title.startswith("Appendix"):
                part = "Appendices"

            sections = []
            for h2 in body.iter(f"{{{NS['x']}}}h2"):
                parent_id = None
                # ElementTree has no parent pointers; the id lives on the section.
                for s in body.iter(f"{{{NS['x']}}}section"):
                    if h2 in list(s):
                        parent_id = s.get("id")
                        break
                n = h2.find("x:span[@class='header-section-number']", NS)
                t = text_of(h2)
                if n is not None and t.startswith(text_of(n)):
                    t = t[len(text_of(n)):].strip()
                if parent_id:
                    sections.append({"id": parent_id, "title": t, "number": text_of(n) if n is not None else None})

            fragment = "".join(self.render(child, href, chapter_ids) + html.escape(child.tail or "", quote=False) for child in body)
            cid = Path(href).stem
            (self.out / "chapters" / f"{cid}.html").write_text(fragment, encoding="utf-8")
            chapters.append({
                "id": cid,
                "title": title,
                "number": number,
                "part": part,
                "words": words,
                "minutes": max(1, round(words / WORDS_PER_MINUTE)),
                "sections": sections,
            })

        cover = self.cover(meta["cover"]) if meta["cover"] else None
        total = sum(c["words"] for c in chapters)
        return {
            "slug": self.slug,
            "title": meta["title"],
            "subtitle": meta["subtitle"],
            "author": meta["author"],
            "date": meta["date"],
            "description": meta["description"],
            "subjects": meta["subjects"],
            "cover": cover,
            "words": total,
            "minutes": max(1, round(total / WORDS_PER_MINUTE)),
            "chapters": chapters,
        }


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    slug, epub = sys.argv[1], Path(sys.argv[2])
    if not re.match(r"^[a-z0-9-]{1,40}$", slug):
        raise SystemExit("slug must be lowercase letters, digits and dashes")
    with tempfile.TemporaryDirectory() as tmp:
        entry = Book(slug, epub, Path(tmp)).build()

    catalogue = json.loads(CATALOGUE.read_text()) if CATALOGUE.exists() else []
    catalogue = [b for b in catalogue if b["slug"] != slug] + [entry]
    catalogue.sort(key=lambda b: b.get("date") or "", reverse=True)
    CATALOGUE.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")
    print(f"{slug}: {len(entry['chapters'])} chapters, {entry['words']:,} words, ~{entry['minutes']} min")


if __name__ == "__main__":
    main()
