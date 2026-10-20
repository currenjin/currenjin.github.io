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
      next unless day.match?(/\A\d{4}-\d{2}-\d{2}\z/)
      begin
        date = Date.iso8601(day)
      rescue ArgumentError
        next
      end
      next if date > site.time.to_date
      item = { 'id'=>row['id'], 'date'=>day, 'title'=>row['title'],
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
