# frozen_string_literal: true
require 'cgi'

module ArchiveSections
  # Read actual converter-generated h2 IDs; never guess anchors from titles.
  def archive_sections(content)
    site = @context.registers[:site]
    html = site.find_converter_instance(Jekyll::Converters::Markdown).convert(content.to_s)
    html.scan(/<h2\b[^>]*\bid="([^"]+)"[^>]*>(.*?)<\/h2>/m).map do |id, body|
      { 'title' => CGI.unescapeHTML(body.gsub(/<[^>]*>/, '')), 'id' => CGI.unescapeHTML(id) }
    end
  end
end
Liquid::Template.register_filter(ArchiveSections)
