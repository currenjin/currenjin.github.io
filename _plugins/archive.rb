# frozen_string_literal: true
require 'time'
require 'ostruct'

# A single publication boundary for canonical articles and authored chapters.
# Requires a normal (not --safe) Jekyll build; see docs/post-authoring.md.
module CanonicalArchive
  def self.public_document?(doc, now)
    return false unless doc.data['public'].equal?(true)
    return false if doc.data['published'].equal?(false) || doc.data['draft'].equal?(true)
    date = Time.parse(doc.data.fetch('date').to_s)
    updated = Time.parse(doc.data.fetch('updated', doc.data['date']).to_s)
    date <= now && updated <= now && updated >= date
  rescue ArgumentError, KeyError
    false
  end

  def self.prepare(site)
    articles = site.collections.fetch('articles').docs
    chapters = site.collections.fetch('chapters').docs
    articles.select! { |doc| public_document?(doc, site.time) }
    eligible = chapters.select { |doc| public_document?(doc, site.time) }
    used = []
    books = []
    ids = []
    Array(site.data['post_books']).each do |metadata|
      next unless metadata['public'].equal?(true)
      id = metadata.fetch('id')
      raise "Invalid or duplicate archive book id: #{id}" unless id.match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/) && !ids.include?(id)
      ids << id
      book = metadata.dup
      book['url'] = "/posts/##{id}"
      book['chapters'] = []
      seen = []
      Array(metadata['chapters']).each do |entry|
        key = entry.fetch('id')
        raise "Duplicate chapter #{id}/#{key}" if seen.include?(key)
        seen << key
        if entry['state'] == 'planned'
          book['chapters'] << { 'title' => entry.fetch('title'), 'planned' => true }
          next
        end
        raise "Unknown chapter state #{entry['state']}" unless entry['state'] == 'published'
        matches = eligible.select { |doc| doc.data['book'] == id && doc.data['chapter_id'] == key }
        raise "Duplicate chapter source #{id}/#{key}" if matches.size > 1
        next if matches.empty? # drafts are not listed, even as a title
        doc = matches.first
        used << doc
        book['chapters'] << { 'title' => doc.data.fetch('title'), 'url' => doc.url, 'document' => doc }
      end
      published = book['chapters'].map { |entry| entry['document'] }.compact
      # Planned-only outlines require explicit approval and valid publication dates.
      if published.empty?
        next unless metadata['state'] == 'planned' && !book['chapters'].empty?
        next unless public_document?(OpenStruct.new(data: metadata), site.time)
        book['updated'] = Time.parse(metadata.fetch('updated', metadata['date']).to_s)
      else
        book['updated'] = published.map { |doc| Time.parse(doc.data.fetch('updated', doc.data['date']).to_s) }.max
      end
      published.each_with_index do |doc, index|
        doc.data['archive_book'] = { 'title' => book.fetch('title'), 'url' => book['url'] }
        doc.data['previous_chapter'] = published[index - 1] if index.positive?
        doc.data['next_chapter'] = published[index + 1]
      end
      books << book
    end
    chapters.select! { |doc| used.include?(doc) }
    site.config['archive_articles'] = articles.sort_by { |doc| Time.parse(doc.data.fetch('date').to_s) }.reverse
    site.config['archive_books'] = books.sort_by { |book| book['updated'] }.reverse
    site.config['archive_documents'] = articles + chapters
    site.config['archive_catalog'] = (
      books.map { |book| { 'kind' => 'series', 'date' => book['updated'], 'book' => book } } +
      articles.map { |doc| { 'kind' => 'article', 'date' => Time.parse(doc.data.fetch('date').to_s), 'document' => doc } }
    ).sort_by { |entry| entry['date'] }.reverse
  end

  class Generator < Jekyll::Generator
    safe false
    priority :highest
    def generate(site)
      CanonicalArchive.prepare(site)
    end
  end
end
