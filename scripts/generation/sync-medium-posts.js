#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const MEDIUM_OUTPUT_PATH = path.join(ROOT, "_data", "medium.json");
const UPDATES_OUTPUT_PATH = path.join(ROOT, "_data", "updates.json");
const WIKI_DIR = path.join(ROOT, "_wiki");
const CONFIG_PATH = path.join(ROOT, "_config.yml");

function readConfigValue(key) {
  if (!fs.existsSync(CONFIG_PATH)) return "";
  const content = fs.readFileSync(CONFIG_PATH, "utf8");
  const match = content.match(new RegExp(`^${key}:\\s*["']?([^"'\n#]+)["']?`, "m"));
  return match ? match[1].trim() : "";
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function stripHtml(text) {
  return decodeEntities(
    text
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function getTagValue(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(re);
  if (!match) return "";
  return stripHtml(match[1]);
}

function toDateOnly(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function parseScalar(v) {
  const value = v.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\[(.*)\]$/.test(value)) {
    return value
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return value.replace(/^["']|["']$/g, "");
}

function parseFrontMatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return {};
  const lines = m[1].split("\n");
  const out = {};
  let currentKey = null;
  for (const line of lines) {
    const keyMatch = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2];
      if (value === "") {
        out[currentKey] = out[currentKey] || [];
      } else {
        out[currentKey] = parseScalar(value);
      }
      continue;
    }
    const listMatch = line.match(/^\s*-\s*(.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(out[currentKey])) out[currentKey] = [];
      out[currentKey].push(parseScalar(listMatch[1]));
    }
  }
  return out;
}

function toDateSortable(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function loadWikiUpdates() {
  if (!fs.existsSync(WIKI_DIR)) return [];
  const files = fs.readdirSync(WIKI_DIR).filter((f) => f.endsWith(".md"));
  const items = [];
  for (const file of files) {
    const fullPath = path.join(WIKI_DIR, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const meta = parseFrontMatter(content);
    const title = (meta.title || "").toString().trim();
    const isPublic = meta.public !== false;
    if (!title || title === "wiki" || !isPublic) continue;
    const slug = file.replace(/\.md$/, "");
    const updated = toDateSortable(meta.updated || meta.date || "");
    const tags = Array.isArray(meta.tags) ? meta.tags.join(", ") : (meta.tags || "");
    items.push({
      title,
      url: `/wiki/${slug}`,
      updated,
      summary: (meta.summary || "").toString(),
      tags,
      source: "Wiki",
      external: false,
    });
  }
  return items;
}

async function main() {
  const feedUrl = process.env.MEDIUM_FEED_URL || readConfigValue("medium_feed_url");
  const limit = Number(process.env.MEDIUM_LIMIT || 8);

  if (!feedUrl) {
    console.log("No medium_feed_url configured. Skipping medium sync.");
    process.exit(0);
  }

  let mediumPosts = [];
  try {
    console.log(`Fetching Medium feed: ${feedUrl}`);
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "currenjin-wiki-medium-sync/1.0",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch feed (${res.status})`);
    }

    const xml = await res.text();
    const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

    mediumPosts = itemBlocks.slice(0, limit).map((block) => {
      const title = getTagValue(block, "title");
      const url = getTagValue(block, "link");
      const publishedAt = toDateOnly(getTagValue(block, "pubDate"));
      const summary = getTagValue(block, "description").slice(0, 220);

      return {
        title,
        url,
        updated: publishedAt,
        published_at: publishedAt,
        summary,
        tags: "",
        source: "Medium",
        external: true,
      };
    }).filter((p) => p.title && p.url);
  } catch (err) {
    console.warn(`Medium fetch failed: ${err.message}`);
    if (fs.existsSync(MEDIUM_OUTPUT_PATH)) {
      try {
        const existing = JSON.parse(fs.readFileSync(MEDIUM_OUTPUT_PATH, "utf8"));
        if (Array.isArray(existing)) {
          mediumPosts = existing;
          console.log(`Loaded ${mediumPosts.length} medium posts from existing data file.`);
        }
      } catch (e) {
        console.warn("Existing medium.json is invalid JSON, continuing with empty list.");
      }
    }
  }

  const wikiPosts = loadWikiUpdates();
  const updates = wikiPosts
    .concat(mediumPosts)
    .filter((p) => p.updated && p.updated !== "")
    .sort((a, b) => new Date(b.updated) - new Date(a.updated));

  fs.mkdirSync(path.dirname(MEDIUM_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(MEDIUM_OUTPUT_PATH, `${JSON.stringify(mediumPosts, null, 2)}\n`, "utf8");
  fs.writeFileSync(UPDATES_OUTPUT_PATH, `${JSON.stringify(updates, null, 2)}\n`, "utf8");
  console.log(`Saved ${mediumPosts.length} medium posts -> ${MEDIUM_OUTPUT_PATH}`);
  console.log(`Saved ${updates.length} merged updates -> ${UPDATES_OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
