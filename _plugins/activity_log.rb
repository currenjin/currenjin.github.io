# frozen_string_literal: true
require 'date'
require 'uri'

# The only public activity view. Raw data can contain drafts; templates must use
# site.activity_log, never site.data.activity_log. Requires a non-safe build.
module ActivityLog
  def self.prepare(site)
    rows = site.data['activity_log']
    rows = [] unless rows.is_a?(Array)
    site.config['activity_log'] = rows.map do |row|
      next unless row.is_a?(Hash) && row['public'].equal?(true)
      next if row['draft'].equal?(true) || row['published'].equal?(false)
      next unless row['id'].is_a?(String) && row['id'].match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/)
      next unless row['title'].is_a?(String) && !row['title'].strip.empty?
      day = row['date'].to_s
      next unless day.match?(/\A[0-9]{4}(?:-[0-9]{2}(?:-[0-9]{2})?)?\z/)
      parts = day.split('-').map(&:to_i)
      next unless parts.first.positive?
      begin
        # Lower bounds are used only to reject future/invalid periods, never published.
        date = Date.new(parts[0], parts[1] || 1, parts[2] || 1)
      rescue ArgumentError
        next
      end
      next if date > site.time.to_date
      precision = { 4=>'year', 7=>'month', 10=>'day' }.fetch(day.length)
      item = { 'id'=>row['id'], 'date'=>day, 'date_precision'=>precision,
               'date_label'=>(precision == 'year' ? day : day[2..-1]), 'title'=>row['title'],
               'url'=>"/log/##{row['id']}" }
      if row['summary'].is_a?(String) && !row['summary'].strip.empty?
        item['summary'] = row['summary']
      end
      if row['result'].is_a?(String) && !row['result'].strip.empty?
        item['result'] = row['result']
      end
      begin
        url = URI.parse(row['project_url'].to_s)
        if url.is_a?(URI::HTTPS) && url.host && !url.host.empty? && !url.userinfo
          item['project_url'] = url.to_s
        end
      rescue URI::InvalidURIError
        # Keep the entry, but never render an unsafe optional project link.
      end
      item
    end.compact.sort_by { |item| item['date'] }.reverse
  end

  class Generator < Jekyll::Generator
    safe false
    priority :highest
    def generate(site)
      ActivityLog.prepare(site)
    end
  end
end
