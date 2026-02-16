#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, "data", "medium.json");
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

async function main() {
  const feedUrl = process.env.MEDIUM_FEED_URL || readConfigValue("medium_feed_url");
  const limit = Number(process.env.MEDIUM_LIMIT || 8);

  if (!feedUrl) {
    console.log("No medium_feed_url configured. Skipping medium sync.");
    process.exit(0);
  }

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

  const posts = itemBlocks.slice(0, limit).map((block) => {
    const title = getTagValue(block, "title");
    const url = getTagValue(block, "link");
    const publishedAt = toDateOnly(getTagValue(block, "pubDate"));
    const summary = getTagValue(block, "description").slice(0, 220);

    return {
      title,
      url,
      published_at: publishedAt,
      summary,
      source: "Medium",
    };
  }).filter((p) => p.title && p.url);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  console.log(`Saved ${posts.length} medium posts -> ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
