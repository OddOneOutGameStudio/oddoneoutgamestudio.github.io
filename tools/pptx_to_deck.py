#!/usr/bin/env python3
"""Convert a .pptx into a web slide deck that assets/js/deck.js can play.

Every picture keeps its position, size, rotation, crop and stacking order, text
stays real text, and animated GIFs keep moving:

  * big opaque GIFs (screen recordings) become MP4,
  * big transparent GIFs become animated WebP,
  * big PNGs become lossless WebP when that is smaller.

Usage:
  python3 tools/pptx_to_deck.py deck.pptx assets/decks/<slug>
  python3 tools/pptx_to_deck.py deck.pptx assets/decks/<slug> --video 11=assets/video/demo.mp4

Needs Pillow (pip install pillow) and ffmpeg on PATH.
"""

import argparse
import json
import posixpath
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

try:
    from PIL import Image, ImageSequence
except ImportError:
    sys.exit("Pillow is required: pip install pillow")

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
R_EMBED = f"{{{NS['r']}}}embed"
R_ID = f"{{{NS['r']}}}id"

BIG = 300_000  # bytes; smaller media is copied as-is
MAX_VIDEO_W = 960
DEFAULT_INSET = 91440
DEFAULT_SIZE = 1800  # hundredths of a point


class Package:
    def __init__(self, path):
        self.zip = zipfile.ZipFile(path)
        self._xml = {}

    def xml(self, part):
        if part not in self._xml:
            self._xml[part] = ET.fromstring(self.zip.read(part))
        return self._xml[part]

    def rels(self, part):
        folder, name = posixpath.split(part)
        rels_part = posixpath.join(folder, "_rels", name + ".rels")
        out = {}
        if rels_part not in self.zip.namelist():
            return out
        for rel in self.xml(rels_part).findall("rel:Relationship", NS):
            target = rel.get("Target")
            if rel.get("TargetMode") != "External":
                target = posixpath.normpath(posixpath.join(folder, target))
            out[rel.get("Id")] = target
        return out


class Converter:
    def __init__(self, pkg, out_dir, source_mtime):
        self.pkg = pkg
        self.source_mtime = source_mtime
        self.out = out_dir
        self.media_dir = out_dir / "media"
        self.media_dir.mkdir(parents=True, exist_ok=True)
        self.media_cache = {}
        self.fonts = set()
        self.tmp = Path(tempfile.mkdtemp())

        pres = pkg.xml("ppt/presentation.xml")
        size = pres.find("p:sldSz", NS)
        self.cx, self.cy = int(size.get("cx")), int(size.get("cy"))
        pres_rels = pkg.rels("ppt/presentation.xml")
        self.slides = [pres_rels[s.get(R_ID)] for s in pres.find("p:sldIdLst", NS)]
        self.colors = self._theme_colors(pres_rels)

    # ---------- colors ----------

    def _theme_colors(self, pres_rels):
        master = next(t for t in pres_rels.values() if "slideMasters/" in t)
        theme = next(t for t in self.pkg.rels(master).values() if "theme/" in t)
        scheme = self.pkg.xml(theme).find(".//a:clrScheme", NS)
        colors = {}
        for el in scheme:
            name = el.tag.split("}")[1]
            srgb = el.find("a:srgbClr", NS)
            sys_clr = el.find("a:sysClr", NS)
            if srgb is not None:
                colors[name] = srgb.get("val")
            elif sys_clr is not None:
                colors[name] = sys_clr.get("lastClr", "000000")
        fonts = self.pkg.xml(theme).find(".//a:fontScheme", NS)
        self.theme_fonts = {
            "+mj-lt": fonts.find("a:majorFont/a:latin", NS).get("typeface"),
            "+mn-lt": fonts.find("a:minorFont/a:latin", NS).get("typeface"),
        }
        cmap = self.pkg.xml(master).find("p:clrMap", NS)
        if cmap is not None:
            for alias, target in cmap.attrib.items():
                if target in colors:
                    colors.setdefault(alias, colors[target])
        return colors

    def color(self, fill):
        """Hex color from an <a:solidFill> (or any element holding a color)."""
        if fill is None:
            return None
        srgb = fill.find("a:srgbClr", NS)
        scheme = fill.find("a:schemeClr", NS)
        if srgb is not None:
            return "#" + srgb.get("val")
        if scheme is not None and scheme.get("val") in self.colors:
            return "#" + self.colors[scheme.get("val")]
        return None

    # ---------- media ----------

    def media(self, part):
        if part in self.media_cache:
            return self.media_cache[part]
        src = self.tmp / posixpath.basename(part)
        src.write_bytes(self.pkg.zip.read(part))
        stem, ext = src.stem, src.suffix.lower()
        size = src.stat().st_size
        result = None

        if ext == ".gif" and size > BIG:
            reused = self._reuse(stem, (".mp4", ".webp"))
            if reused:
                self.media_cache[part] = reused
                return reused
            with Image.open(src) as im:
                animated = getattr(im, "n_frames", 1) > 1
                alpha = "transparency" in im.info or im.mode in ("RGBA", "LA", "PA")
            if animated and not alpha:
                result = self._to_mp4(src, self.media_dir / f"{stem}.mp4")
            elif animated:
                result = self._to_webp(src, self.media_dir / f"{stem}.webp", animated=True)
        elif ext == ".png" and size > BIG:
            reused = self._reuse(stem, (".webp",))
            if reused:
                self.media_cache[part] = reused
                return reused
            result = self._to_webp(src, self.media_dir / f"{stem}.webp", animated=False)

        if result is None:
            dest = self.media_dir / src.name
            shutil.copyfile(src, dest)
            result = {"src": f"media/{dest.name}", "kind": "img"}
        self.media_cache[part] = result
        return result

    def _reuse(self, stem, exts):
        """A converted file from an earlier run of the same .pptx, if there is one."""
        for ext in exts:
            dest = self.media_dir / f"{stem}{ext}"
            if dest.exists() and dest.stat().st_mtime > self.source_mtime:
                return {"src": f"media/{dest.name}", "kind": "video" if ext == ".mp4" else "img"}
        return None

    def _to_mp4(self, src, dest):
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
             # Clips sit inside a slide, so 960 px wide is plenty even in full screen.
             "-vf", f"scale='trunc(min({MAX_VIDEO_W},iw)/2)*2':-2:flags=area",
             "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p",
             "-movflags", "+faststart", "-an", str(dest)],
            check=True,
        )
        return {"src": f"media/{dest.name}", "kind": "video"}

    def _to_webp(self, src, dest, animated):
        with Image.open(src) as im:
            if animated:
                frames, durations = [], []
                for frame in ImageSequence.Iterator(im):
                    frames.append(frame.convert("RGBA"))
                    durations.append(frame.info.get("duration", im.info.get("duration", 100)) or 100)
                frames[0].save(dest, save_all=True, append_images=frames[1:], duration=durations,
                               loop=0, lossless=True, method=4)
            else:
                im.save(dest, lossless=True, method=6)
        if dest.stat().st_size >= src.stat().st_size:
            dest.unlink()
            return None
        return {"src": f"media/{dest.name}", "kind": "img"}

    # ---------- geometry ----------

    def box(self, xfrm, group):
        off, ext = xfrm.find("a:off", NS), xfrm.find("a:ext", NS)
        x, y = int(off.get("x")), int(off.get("y"))
        w, h = int(ext.get("cx")), int(ext.get("cy"))
        x, y, w, h = group(x, y, w, h)
        # Lengths in % of the slide width; the viewer maps them onto cqw.
        k = 100 / self.cx
        el = {"x": round(x * k, 3), "y": round(y * k, 3), "w": round(w * k, 3), "h": round(h * k, 3)}
        rot = int(xfrm.get("rot", 0)) / 60000
        if rot:
            el["rot"] = round(rot, 2)
        if xfrm.get("flipH") == "1":
            el["flipH"] = True
        if xfrm.get("flipV") == "1":
            el["flipV"] = True
        return el

    def em(self, emu):
        return round(int(emu) * 100 / self.cx, 3)

    # ---------- shapes ----------

    def walk(self, tree, rels, group=lambda *v: v):
        out = []
        for node in tree:
            tag = node.tag.split("}")[1]
            if tag == "pic":
                el = self.picture(node, rels, group)
            elif tag == "sp":
                el = self.shape(node, group)
            elif tag == "grpSp":
                out += self.walk(node, rels, self.group_map(node, group))
                continue
            else:
                continue
            if el:
                out.append(el)
        return out

    def group_map(self, grp, parent):
        xfrm = grp.find("p:grpSpPr/a:xfrm", NS)
        if xfrm is None:
            return parent
        off, ext = xfrm.find("a:off", NS), xfrm.find("a:ext", NS)
        choff, chext = xfrm.find("a:chOff", NS), xfrm.find("a:chExt", NS)
        ox, oy = int(off.get("x")), int(off.get("y"))
        cx0, cy0 = int(choff.get("x")), int(choff.get("y"))
        sx = int(ext.get("cx")) / (int(chext.get("cx")) or 1)
        sy = int(ext.get("cy")) / (int(chext.get("cy")) or 1)

        def mapping(x, y, w, h):
            return parent(ox + (x - cx0) * sx, oy + (y - cy0) * sy, w * sx, h * sy)
        return mapping

    def picture(self, pic, rels, group):
        blip = pic.find("p:blipFill/a:blip", NS)
        xfrm = pic.find("p:spPr/a:xfrm", NS)
        if blip is None or xfrm is None or blip.get(R_EMBED) not in rels:
            return None
        el = {"type": "image", **self.box(xfrm, group), **self.media(rels[blip.get(R_EMBED)])}
        props = pic.find("p:nvPicPr/p:cNvPr", NS)
        if props.get("descr"):
            el["alt"] = props.get("descr")
        link = props.find("a:hlinkClick", NS)
        if link is not None and link.get(R_ID) in rels:
            el["link"] = rels[link.get(R_ID)]
        alpha = blip.find("a:alphaModFix", NS)
        if alpha is not None and alpha.get("amt"):
            el["opacity"] = int(alpha.get("amt")) / 100000
        crop = pic.find("p:blipFill/a:srcRect", NS)
        if crop is not None:
            c = {k: int(crop.get(k, 0)) / 100000 for k in ("l", "t", "r", "b")}
            if any(c.values()):
                el["crop"] = c
        return el

    def shape(self, sp, group):
        kind, sources = self.placeholder_sources(sp)
        xfrm = sp.find("p:spPr/a:xfrm", NS)
        for source in reversed(sources):  # a placeholder may take its box from the layout or master
            if xfrm is None:
                xfrm = source.find("p:spPr/a:xfrm", NS)
        if xfrm is None:
            return None
        el = {"type": "shape", **self.box(xfrm, group)}
        sppr = sp.find("p:spPr", NS)
        fill = self.color(sppr.find("a:solidFill", NS))
        if fill:
            el["fill"] = fill
        geom = sppr.find("a:prstGeom", NS)
        if geom is not None and geom.get("prst") in ("ellipse", "roundRect"):
            el["geom"] = geom.get("prst")
        line = sppr.find("a:ln", NS)
        if line is not None and line.find("a:noFill", NS) is None:
            stroke = self.color(line.find("a:solidFill", NS))
            if stroke:
                el["stroke"] = stroke
                el["strokeW"] = self.em(line.get("w", 12700))

        body = sp.find("p:txBody", NS)
        if body is not None:
            bodies = [s.find("p:txBody/a:bodyPr", NS) for s in sources] + [body.find("a:bodyPr", NS)]
            bp = {}
            for b in bodies:
                if b is not None:
                    bp.update(b.attrib)
            autofit = body.find("a:bodyPr/a:normAutofit", NS)
            scale = int(autofit.get("fontScale", 100000)) / 100000 if autofit is not None else 1
            styles = self.text_styles(sp, kind, sources)
            paragraphs = self.paragraphs(body, styles, scale)
            if any(r["text"].strip() for p in paragraphs for r in p["runs"]):
                el["text"] = paragraphs
                el["inset"] = [self.em(bp.get(k, DEFAULT_INSET)) for k in ("tIns", "rIns", "bIns", "lIns")]
                el["anchor"] = bp.get("anchor", "t")
        if "text" not in el and not fill and "stroke" not in el:
            return None
        return el

    # ---------- text ----------

    def placeholder_sources(self, sp):
        """For a placeholder: its type and the matching shapes on the master and layout."""
        ph = sp.find("p:nvSpPr/p:nvPr/p:ph", NS)
        if ph is None:
            return None, []
        kind, idx = ph.get("type", "body"), ph.get("idx")
        found = []
        for part in reversed(self.parts[1:]):  # master first, then layout
            candidates = [c for c in self.pkg.xml(part).iter(f"{{{NS['p']}}}sp")
                          if c.find("p:nvSpPr/p:nvPr/p:ph", NS) is not None]
            match = next((c for c in candidates
                          if idx is not None and c.find("p:nvSpPr/p:nvPr/p:ph", NS).get("idx") == idx), None)
            match = match or next((c for c in candidates
                                   if c.find("p:nvSpPr/p:nvPr/p:ph", NS).get("type", "body") == kind), None)
            if match is not None:
                found.append(match)
        return kind, found

    def text_styles(self, sp, kind, sources):
        """List styles that apply to a text box, least specific first."""
        master = self.pkg.xml(self.parts[-1])
        if kind in ("title", "ctrTitle"):
            name = "titleStyle"
        elif kind in (None, "dt", "ftr", "sldNum"):
            name = "otherStyle"
        else:
            name = "bodyStyle"
        styles = [master.find(f"p:txStyles/p:{name}", NS)]
        styles += [s.find("p:txBody/a:lstStyle", NS) for s in sources]
        styles.append(sp.find("p:txBody/a:lstStyle", NS))
        return [s for s in styles if s is not None]

    def pt(self, points):
        """Points as % of the slide width (1 pt = 12700 EMU)."""
        return round(points * 12700 * 100 / self.cx, 3)

    def para_props(self, el, props):
        if el is None:
            return props
        props = dict(props)
        for k in ("algn", "marL", "indent"):
            if el.get(k) is not None:
                props[k] = el.get(k)
        for k in ("lnSpc", "spcBef", "spcAft"):
            sub = el.find(f"a:{k}", NS)
            if sub is not None:
                pct, pts = sub.find("a:spcPct", NS), sub.find("a:spcPts", NS)
                if pct is not None:
                    props[k] = ("pct", int(pct.get("val")) / 100000)
                elif pts is not None:
                    props[k] = ("pts", int(pts.get("val")) / 100)
        return props

    def run_props(self, el, props):
        if el is None:
            return props
        props = dict(props)
        for k in ("sz", "b", "i", "u"):
            if el.get(k) is not None:
                props[k] = el.get(k)
        color = self.color(el.find("a:solidFill", NS))
        if color:
            props["color"] = color
        latin = el.find("a:latin", NS)
        if latin is not None and latin.get("typeface"):
            face = latin.get("typeface")
            props["font"] = self.theme_fonts.get(face, face)
        return props

    def paragraphs(self, body, styles, scale):
        out = []
        for p in body.findall("a:p", NS):
            ppr = p.find("a:pPr", NS)
            level = int(ppr.get("lvl", 0)) if ppr is not None else 0
            pp, rp = {}, {}
            for style in styles:
                lvl = style.find(f"a:lvl{level + 1}pPr", NS)
                pp = self.para_props(lvl, pp)
                rp = self.run_props(lvl.find("a:defRPr", NS) if lvl is not None else None, rp)
            pp = self.para_props(ppr, pp)

            para = {"align": pp.get("algn", "l"), "runs": []}
            if int(pp.get("marL", 0)):
                para["marL"] = self.em(pp["marL"])
            if int(pp.get("indent", 0)):
                para["indent"] = self.em(pp["indent"])
            for node in p:
                tag = node.tag.split("}")[1]
                if tag == "br":
                    para["runs"].append({"text": "\n"})
                elif tag in ("r", "fld"):
                    para["runs"].append(self.run(node.find("a:rPr", NS), node.findtext("a:t", "", NS), rp, scale))
            if not para["runs"]:
                para["runs"].append(self.run(p.find("a:endParaRPr", NS), "", rp, scale))

            # Spacing: line height as a multiple of 1.2 × font size, gaps in % of slide width.
            size = max(r["size"] for r in para["runs"] if "size" in r)
            for key, name in (("lnSpc", "lineHeight"), ("spcBef", "before"), ("spcAft", "after")):
                if key not in pp:
                    continue
                unit, val = pp[key]
                if key == "lnSpc":
                    para[name] = round(val if unit == "pct" else self.pt(val) / size / 1.2, 3)
                elif val:
                    para[name] = round(self.pt(val * scale) if unit == "pts" else val * size * 1.2, 3)
            out.append(para)
        return out

    def run(self, rpr, text, base, scale):
        props = self.run_props(rpr, base)
        run = {"text": text, "size": self.pt(int(props.get("sz", DEFAULT_SIZE)) / 100 * scale)}
        if props.get("b") == "1":
            run["bold"] = True
        if props.get("i") == "1":
            run["italic"] = True
        if props.get("u", "none") != "none":
            run["underline"] = True
        if props.get("color"):
            run["color"] = props["color"]
        font = props.get("font")
        if font and not font.startswith("+"):
            run["font"] = font
            if text.strip():
                self.fonts.add(font)
        return run

    # ---------- slides ----------

    def chain(self, part):
        """A slide part followed by its layout and master."""
        chain = [part]
        for kind in ("/slideLayout", "/slideMaster"):
            parent = next((t for t in self.pkg.rels(chain[-1]).values() if kind in t), None)
            if parent:
                chain.append(parent)
        return chain

    def background(self):
        """Background of the current slide, falling back to its layout and master."""
        for part in self.parts:
            rels = self.pkg.rels(part)
            bg = self.pkg.xml(part).find("p:cSld/p:bg/p:bgPr", NS)
            if bg is None:
                continue
            blip = bg.find("a:blipFill/a:blip", NS)
            if blip is not None and blip.get(R_EMBED) in rels:
                return {"image": self.media(rels[blip.get(R_EMBED)])["src"]}
            color = self.color(bg.find("a:solidFill", NS))
            if color:
                return {"color": color}
        return {"color": "#" + self.colors.get("lt1", "FFFFFF")}

    def video(self, src):
        """A URL stays as is; a local file is copied next to the deck."""
        path = Path(src)
        if "://" in src or not path.is_file():
            return src
        shutil.copyfile(path, self.media_dir / path.name)
        return f"media/{path.name}"

    def convert(self, videos):
        deck = {"width": self.cx, "height": self.cy, "fonts": [], "slides": []}
        for n, part in enumerate(self.slides, 1):
            root = self.pkg.xml(part)
            print(f"slide {n}/{len(self.slides)}", file=sys.stderr)
            self.parts = self.chain(part)
            slide = {
                "background": self.background(),
                "elements": self.walk(root.find("p:cSld/p:spTree", NS), self.pkg.rels(part)),
            }
            if n in videos:
                slide["video"] = self.video(videos[n])
            deck["slides"].append(slide)
        deck["fonts"] = sorted(self.fonts)
        used = {m["src"] for m in self.media_cache.values()} | {s["video"] for s in deck["slides"] if "video" in s}
        for f in self.media_dir.iterdir():
            if f"media/{f.name}" not in used:
                f.unlink()
        (self.out / "deck.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf8")
        shutil.rmtree(self.tmp, ignore_errors=True)
        total = sum(f.stat().st_size for f in self.media_dir.iterdir())
        print(f"wrote {self.out / 'deck.json'} · {len(deck['slides'])} slides · media {total / 1e6:.1f} MB",
              file=sys.stderr)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pptx", type=Path)
    ap.add_argument("out", type=Path, help="output folder, e.g. assets/decks/my-game")
    ap.add_argument("--video", action="append", default=[], metavar="SLIDE=SRC",
                    help="play a video on that slide: a local .mp4 (copied next to the deck) or a YouTube / Google Drive URL")
    args = ap.parse_args()

    videos = {}
    for item in args.video:
        n, src = item.split("=", 1)
        videos[int(n)] = src

    args.out.mkdir(parents=True, exist_ok=True)
    Converter(Package(args.pptx), args.out, args.pptx.stat().st_mtime).convert(videos)


if __name__ == "__main__":
    main()
