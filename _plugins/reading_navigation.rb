# frozen_string_literal: true
# A shared, serializable reading contract; never expose raw draft documents.
require_relative 'public_seo'
module ReadingNavigation
  def self.attach(documents, series)
    view = series.slice('id', 'title', 'url').merge('chapters' => series.fetch('chapters').map { |entry| entry.slice('title', 'url', 'planned') })
    documents.each_with_index do |doc, index|
      doc.data['reading_series'] = view
      doc.data['reading_previous'] = index.positive? ? link(documents[index - 1]) : nil
      doc.data['reading_next'] = documents[index + 1] ? link(documents[index + 1]) : nil
    end
  end

  def self.link(doc)
    { 'title' => doc.data.fetch('title'), 'url' => doc.url }
  end

  def self.prepare_wiki(site)
    return unless site.collections['wiki']
    documents = site.collections['wiki'].docs
    candidates = documents.select { |doc| doc.data.key?('series') }
    used = []
    seen = []
    Array(site.data['wiki_series']).each do |metadata|
      next unless metadata['public'].equal?(true)
      next if metadata['draft'].equal?(true) || metadata['published'].equal?(false)
      id = metadata.fetch('id')
      raise "Invalid or duplicate Wiki series id: #{id}" unless id.match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/) && !seen.include?(id)
      seen << id
      keys = []
      members = Array(metadata['chapters']).filter_map do |entry|
        key = entry.fetch('id')
        raise "Invalid or duplicate Wiki chapter: #{key}" unless key.match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/) && !keys.include?(key)
        keys << key
        raise "Unknown Wiki chapter state: #{entry['state']}" unless %w[published planned].include?(entry['state'])
        next unless entry['state'] == 'published' # Wiki has no approved planned-title catalog.
        matches = candidates.select do |doc|
          doc.data['series'] == id && doc.relative_path.sub(/\.[^.]+\z/, '') == "_wiki/#{key}" &&
            CanonicalArchive.public_document?(doc, site.time) &&
            %w[date updated].all? { |key| PublicSEO.valid_date(doc.data[key]) }
        end
        raise "Duplicate Wiki chapter source: #{id}/#{key}" if matches.size > 1
        matches.first
      end
      next if members.empty?
      series = metadata.merge('chapters' => members.map { |doc| link(doc) })
      attach(members, series)
      used.concat(members)
    end
    # Claiming series membership opts into strict publication; standalone Wiki
    # documents keep their existing publication rules, content and public IDs.
    documents.reject! { |doc| doc.data.key?('series') && !used.include?(doc) }
  end
end
