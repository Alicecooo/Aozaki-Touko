"""Exercise the real Hugo build and check the generated browsing contract.

No third-party Python packages are required. Use --stress for 1000-article fixtures.
"""
import argparse
import json
import shutil
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://alicecooo.github.io/Aozaki-Touko/"


class Node:
    def __init__(self, tag="", attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def has_class(self, name):
        return name in self.attrs.get("class", "").split()

    def text(self):
        return "".join(child.text() if isinstance(child, Node) else child for child in self.children)


class Document(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        self.stack[-1].children.append(text)

    def nodes(self):
        return list(self.root.walk())


def build(source, destination, success=True):
    result = subprocess.run(["hugo", "--source", str(source), "--destination", str(destination), "--baseURL", BASE, "--minify"], capture_output=True, text=True, encoding="utf-8")
    if success and result.returncode:
        raise AssertionError(result.stdout + result.stderr)
    if not success:
        assert result.returncode != 0, "Invalid content unexpectedly passed Hugo validation"
    return result


def output_path(public, url):
    path = unquote(urlsplit(url).path)
    prefix = urlsplit(BASE).path
    assert path.startswith(prefix), f"Link escaped GitHub Pages project prefix: {url}"
    relative = path[len(prefix):]
    target = (public / relative).resolve()
    assert target.is_relative_to(public.resolve()), f"Link escaped output: {url}"
    return target / "index.html" if path.endswith("/") else target


def check(public, expected_count=None):
    index = json.loads((public / "index.json").read_text(encoding="utf-8"))
    items = index["items"]
    urls = [item["url"] for item in items]
    assert len(set(urls)) == len(urls), "Duplicate search URLs"
    if expected_count is not None:
        assert len(items) == expected_count, (len(items), expected_count)
    compatibility = json.loads((ROOT / "tests/fixtures/article-urls.json").read_text(encoding="utf-8"))
    assert set(compatibility).issubset(urls), "An existing article URL changed or disappeared"
    docs = {}
    for page in public.rglob("*.html"):
        # Only parse routes that participate in the knowledge browsing flows.
        relative = page.relative_to(public).as_posix()
        if relative.startswith(("tags/", "categories/", "series/")) or relative == "404.html":
            continue
        doc = Document(page)
        if any(n.attrs.get("http-equiv", "").lower() == "refresh" for n in doc.nodes()):
            continue  # Hugo's page/1 alias is a redirect, not a list page.
        docs[page.resolve()] = doc
    links_checked = set()
    for page, doc in docs.items():
        nodes = doc.nodes()
        assert sum(node.tag == "main" for node in nodes) == 1, f"Nested main: {page}"
        for node in nodes:
            # Check navigation and added components; old article-body outbound
            # references are outside this migration's contract.
            classes = node.attrs.get("class", "").split()
            if not (node.tag == "header" or node.attrs.get("id") == "menu" or node.has_class("toc") or any(name.startswith("kb-") for name in classes)):
                continue
            for link in node.walk():
                url = link.attrs.get("href") or (link.attrs.get("src") if link.tag in ("img", "script") else None)
                if not url:
                    continue
                current_url = urljoin(BASE, page.relative_to(public).as_posix())
                absolute = urljoin(current_url, url)
                if urlsplit(absolute).netloc != urlsplit(BASE).netloc:
                    continue
                target = output_path(public, absolute)
                assert target.exists(), f"Broken navigation: {page.name}: {url} -> {target}"
                links_checked.add(absolute.split("#")[0])
                fragment = unquote(urlsplit(absolute).fragment)
                if fragment and target.suffix == ".html":
                    target_doc = docs.get(target.resolve()) or Document(target)
                    assert any(n.attrs.get("id") == fragment for n in target_doc.nodes()), f"Broken anchor: {url}"
    for item in items:
        article = docs[output_path(public, item["url"]).resolve()]
        nodes = article.nodes()
        assert any(n.has_class("kb-article-context") for n in nodes), item["url"]
        assert item["content"], f"Missing full text: {item['url']}"
    home = docs[(public / "index.html").resolve()].nodes()
    avatar = next(n for n in home if n.attrs.get("id") == "home-info-avatar")
    assert output_path(public, avatar.attrs["src"]).exists(), "Homepage avatar is missing"
    assert sum(n.has_class("kb-row") for n in home) == min(3, len(items)), "Home must show only three recent entries"
    assert not any(n.tag == "form" for n in home), "Homepage should have no search form"
    assert not any("github.com" in n.attrs.get("href", "") for n in home), "Homepage should have no GitHub icon"
    # Contract: automatic playback uses an expandable playlist, with local media.
    music_tracks = []
    for audio in [n for n in home if n.tag == "audio"]:
        assert audio.attrs.get("preload") == "metadata"
        assert audio.attrs.get("data-autoplay") == "true"
        music_tracks = json.loads(audio.attrs["data-tracks"])
        assert music_tracks and len({track['id'] for track in music_tracks}) == len(music_tracks)
        for track in music_tracks:
            assert output_path(public, track["src"]).exists(), "Music source is missing"
    icons = [n for n in home if n.tag == "link" and n.attrs.get("rel") == "icon"]
    assert icons[-1].attrs.get("type") == "image/svg+xml"
    assert output_path(public, icons[-1].attrs["href"]).exists()
    # Gap: secondary footer links and topic extras persisted after simplification.
    for footer in [n for n in home if n.tag == "footer"]:
        assert not any(urlsplit(n.attrs.get("href", "")).path.endswith(("/search/", "/about/")) for n in footer.walk()), "Unwanted footer links"
    menu = next(n for n in home if n.attrs.get("id") == "menu")
    assert [urlsplit(n.attrs["href"]).path for n in menu.walk() if n.tag == "a"] == [urlsplit(BASE).path + route for route in ("", "topics/", "notes/", "archives/")], "Navigation must contain only the four requested sections"
    assert not (public / "paths/index.html").exists(), "Independent Paths page should be removed"
    tree = docs[(public / "topics/index.html").resolve()].nodes()
    assert any(n.tag == "details" and n.has_class("kb-tree-root") for n in tree), "Topics must be a collapsible tree"
    assert not any("阅读顺序" in n.text() for n in tree if n.tag == "summary")
    assert not any(n.text().strip() == "全部文章 →" for n in tree if n.tag == "a")
    # Gap: repeated Page wrappers must not produce duplicate tag folders.
    for root in [n for n in tree if n.has_class("kb-tree-root")]:
        group = next(n for n in root.children if isinstance(n, Node) and n.has_class("kb-tree-children"))
        folders = [next(n for n in child.children if isinstance(n, Node) and n.tag == "summary").text() for child in group.children if isinstance(child, Node) and child.has_class("kb-tree-branch")]
        assert len(folders) == len(set(folders)), "Duplicate folders in a topic"
    topic_pages = 0
    for page, doc in docs.items():
        rel = page.relative_to(public).as_posix()
        if rel.startswith("topics/") and rel != "topics/index.html":
            topic_pages += 1
            content = [n for n in doc.nodes() if n.attrs.get("id") == "all-content"]
            assert content, f"Missing topic content list: {rel}"
            assert sum(n.has_class("kb-row") for n in content[0].walk()) <= 12, f"Unbounded topic list: {rel}"
    search_page = docs[(public / "search/index.html").resolve()].nodes()
    search = list(next(n for n in search_page if n.attrs.get("id") == "kb-search").walk())
    assert len([n for n in search if n.tag == "input" and n.attrs.get("type") == "search"]) == 1
    assert not any(n.tag == "select" for n in search), "Search should have no filter panel"
    return {"articles": len(items), "avatar_present": True, "music_tracks": len(music_tracks), "existing_urls_preserved": len(compatibility), "index_bytes": (public / "index.json").stat().st_size, "navigation_targets": len(links_checked), "topic_pages": topic_pages, "urls": sorted(urls)}


def write_post(path, *, extra="", topics="[backend]", body="A full-text fixture about pagination and search."):
    path.write_text(f"---\ntitle: {path.stem}\ndate: 2026-01-01T12:00:00+08:00\ntopics: {topics}\n{extra}---\n\n{body}\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stress", action="store_true")
    args = parser.parse_args()
    runs = ROOT / "tests/fixtures/runs"
    runs.mkdir(parents=True, exist_ok=True)
    run = Path(tempfile.mkdtemp(prefix="hugo-", dir=runs))
    build(ROOT, run / "site")
    manifest = {"production": check(run / "site")}
    if args.stress:
        source = run / "stress-source"
        source.mkdir()
        for name in ("archetypes", "assets", "content", "data", "i18n", "layouts", "static", "themes"):
            shutil.copytree(ROOT / name, source / name, ignore=shutil.ignore_patterns(".git", "node_modules"))
        shutil.copy2(ROOT / "hugo.yaml", source / "hugo.yaml")
        # A second real media entry verifies playlist expansion without changing
        # the production song list or downloading an unrelated song.
        home_doc = Document(run / "site/index.html")
        audio = next(n for n in home_doc.nodes() if n.tag == "audio")
        seed_track = json.loads(audio.attrs["data-tracks"])[0]
        relative_src = urlsplit(seed_track["src"]).path.removeprefix(urlsplit(BASE).path)
        music_file = source / "data/music.yaml"
        music_file.write_text(music_file.read_text(encoding="utf-8") + f'\n  - id: playlist-verification\n    title: 第二首（验证）\n    src: {relative_src}\n', encoding="utf-8")
        posts = source / "content/notes"
        for i in range(1000 - manifest["production"]["articles"]):
            write_post(posts / f"scale-fixture-{i:04d}.md")
        write_post(posts / "excluded-draft.md", extra="draft: true\n")
        write_post(posts / "excluded-hidden.md", extra="hidden: true\n")
        write_post(posts / "excluded-future.md", extra="publishDate: 2999-01-01T12:00:00+08:00\n")
        build(source, run / "stress-site")
        manifest["stress"] = check(run / "stress-site", 1000)
        assert manifest["stress"]["music_tracks"] == manifest["production"]["music_tracks"] + 1
        assert not any("excluded-" in url for url in manifest["stress"]["urls"])
        assert (run / "stress-site/topics/backend/page/2/index.html").exists()
        assert (run / "stress-site/notes/page/2/index.html").exists()
        write_post(posts / "invalid-metadata.md", topics="[]")
        build(source, run / "invalid-metadata-output", success=False)
        (posts / "invalid-metadata.md").unlink()
        manifest["invalid_content_rejected"] = True
    (run / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"result": "passed", "articles": manifest["production"]["articles"], "stress_articles": manifest.get("stress", {}).get("articles"), "manifest": str(run / "manifest.json")}, ensure_ascii=True))


if __name__ == "__main__":
    main()
