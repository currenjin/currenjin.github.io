# frozen_string_literal: true
require 'time'
require 'ostruct'
require_relative 'reading_navigation'

# Post is one source collection. Book membership is a publication constraint,
# not a second collection; public routes remain independent of source folders.
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

  def self.book_document?(doc)
    doc.relative_path.start_with?('_post/books/') || doc.data.key?('book') || doc.data.key?('chapter_id')
  end

  def self.route(doc)
    return if doc.data['permalink']
    path = doc.relative_path.sub(%r{\A_post/}, '').sub(/\.[^.]+\z/, '')
    path = path.sub(%r{\Abooks/}, 'chapters/') if book_document?(doc)
    doc.data['permalink'] = "/posts/#{path}/"
    # A prior generator may have requested the default collection URL already.
    doc.remove_instance_variable(:@url) if doc.instance_variable_defined?(:@url)
  end

  def self.prepare_book(metadata, eligible, now)
    id = metadata.fetch('id')
    book = metadata.merge('url' => "/posts/##{id}", 'chapters' => [])
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
      next if matches.empty? # Draft titles are never exposed as planned titles.
      doc = matches.first
      book['chapters'] << { 'title' => doc.data.fetch('title'), 'url' => doc.url, 'document' => doc }
    end
    published = book['chapters'].map { |entry| entry['document'] }.compact
    if published.empty?
      return unless metadata['state'] == 'planned' && !book['chapters'].empty?
      return unless public_document?(OpenStruct.new(data: metadata), now)
      book['updated'] = Time.parse(metadata.fetch('updated', metadata['date']).to_s)
    else
      book['updated'] = published.map { |doc| Time.parse(doc.data.fetch('updated', doc.data['date']).to_s) }.max
    end
    published.each_with_index do |doc, index|
      doc.data['archive_book'] = { 'title' => book.fetch('title'), 'url' => book['url'] }
      doc.data['previous_chapter'] = index.positive? ? published[index - 1] : nil
      doc.data['next_chapter'] = published[index + 1]
    end
    ReadingNavigation.attach(published, book)
    book
  end

  def self.prepare(site)
    ReadingNavigation.prepare_wiki(site)
    documents = site.collections.fetch('post').docs
    eligible = documents.select { |doc| public_document?(doc, site.time) }
    eligible.each { |doc| route(doc) }
    chapters, articles = eligible.partition { |doc| book_document?(doc) }
    # Approval metadata cannot authorize a different book's source path.
    chapters.select! do |doc|
      doc.data['book'] && doc.data['chapter_id'] &&
        doc.relative_path.sub(/\.[^.]+\z/, '') == "_post/books/#{doc.data['book']}/#{doc.data['chapter_id']}"
    end
    ids = []
    books = Array(site.data['post_books']).map do |metadata|
      next unless metadata['public'].equal?(true)
      id = metadata.fetch('id')
      raise "Invalid or duplicate archive book id: #{id}" unless id.match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/) && !ids.include?(id)
      ids << id
      prepare_book(metadata, chapters, site.time)
    end.compact
    used = books.flat_map { |book| book['chapters'].map { |entry| entry['document'] }.compact }
    chapters.select! { |doc| used.include?(doc) }
    documents.replace(articles + chapters)
    # Stable view contracts for Home, Post, search and SEO; never re-filter in Liquid.
    site.config['archive_articles'] = articles.sort_by { |doc| Time.parse(doc.data.fetch('date').to_s) }.reverse
    site.config['archive_books'] = books.sort_by { |book| book['updated'] }.reverse
    site.config['archive_documents'] = documents
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
