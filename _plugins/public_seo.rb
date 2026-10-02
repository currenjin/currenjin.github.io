# frozen_string_literal: true
require 'date'
require 'time'
require 'uri'
require 'yaml'

# Normal (non-safe) builds only, like archive.rb. Filter the actual collections,
# not just the sitemap, so withdrawn records cannot leak into files or catalogs.
module PublicSEO
  INDEX_PATHS = %w[/ /wiki/index/ /posts/ /reviews/ /graph/ /tag/].freeze
  def self.valid_date(value)
    return value.iso8601 if value.is_a?(Time) || value.is_a?(Date)
    return nil unless value.is_a?(String)
    text = value.strip.sub(/\A(\d{4})-(\d{1,2})-(\d{1,2})(?= |T|\z)/) do
      format('%s-%02d-%02d', Regexp.last_match(1), Regexp.last_match(2).to_i, Regexp.last_match(3).to_i)
    end
    # Same bounded date grammar as the independent source verifier. Never use
    # permissive Time.parse here: prose and impossible dates are not evidence.
    match = text.match(/\A(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z| ?[+-]\d{2}:?\d{2}))?\z/)
    return nil unless match
    date = Date.iso8601(match[1]) # Time may silently roll invalid days forward
    return date.iso8601 unless match[2]
    return nil unless match[2].to_i < 24 && match[3].to_i < 60 && match[4].to_i < 60
    offset = match[6].strip.sub(/([+-]\d{2})(\d{2})\z/, '\\1:\\2')
    return nil if offset != 'Z' && (offset[1, 2].to_i >= 24 || offset[-2, 2].to_i >= 60)
    normalized = "#{date.iso8601}T#{match[2]}:#{match[3]}:#{match[4]}#{match[5]}#{offset}"
    Time.iso8601(normalized).iso8601(match[5] ? match[5].length - 1 : 0)
  rescue ArgumentError
    nil
  end

  def self.lastmod(authored)
    valid_date(authored['updated']) || valid_date(authored['date'])
  end

  def self.public_document?(doc, now)
    data = doc.data
    return false if data['public'].equal?(false) || data['published'].equal?(false) || data['draft'].equal?(true)
    %w[date updated].each do |key|
      stamp = valid_date(data[key])
      return false if stamp && Time.parse(stamp) > now
    end
    true
  end

  def self.canonical(site, path)
    return nil if path.to_s.empty? || path.include?('#') || %w[/books/ /wiki/].include?(path)
    base = site.config.fetch('url').sub(%r{/+$}, '')
    raise 'SEO requires an HTTPS site.url' unless base.start_with?('https://')
    # Preserve already-encoded paths; encode UTF-8 and reserved path characters.
    url = base + site.config.fetch('baseurl', '').to_s + path.sub(/index\.html\z/, '')
    URI::DEFAULT_PARSER.escape(url, /[^A-Za-z0-9\-._~:\/%]/)
  end

  def self.authored_data(doc)
    # Jekyll inserts default dates into documents: only source frontmatter is evidence.
    return {} unless doc.respond_to?(:path) && doc.path && File.file?(doc.path)
    source = File.read(doc.path, encoding: 'UTF-8')
    match = source.match(/\A---\s*\n(.*?)\n---\s*(?:\n|\z)/m)
    match ? (YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}) : {}
  end

  def self.prepare(site)
    %w[wiki reviews].each do |name|
      site.collections.fetch(name).docs.select! { |doc| public_document?(doc, site.time) }
    end
    documents = %w[wiki reviews].flat_map { |name| site.collections.fetch(name).docs }
    documents += Array(site.config['archive_documents']) # archive.rb owns publication
    documents += site.pages.select { |page| INDEX_PATHS.include?(page.url) && public_document?(page, site.time) }
    entries = {}
    documents.each do |doc|
      next if doc.data['sitemap'].equal?(false) || doc.data['noindex'].equal?(true)
      next if doc.data['canonical_url'] && doc.data['canonical_url'] != doc.url
      loc = canonical(site, doc.url)
      next unless loc
      entries[loc] ||= { 'loc' => loc, 'lastmod' => lastmod(authored_data(doc)) }
    end
    site.config['public_sitemap'] = entries.values.sort_by { |entry| entry['loc'] }
  end

  module Filters
    def seo_uri_escape(input)
      URI::DEFAULT_PARSER.escape(input.to_s, /[^A-Za-z0-9\-._~:\/%]/)
    end
  end
  Liquid::Template.register_filter(Filters) if defined?(Liquid::Template)

  class Generator < Jekyll::Generator
    safe false
    priority :low
    def generate(site)
      PublicSEO.prepare(site)
    end
  end
end
