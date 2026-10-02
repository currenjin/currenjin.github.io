# frozen_string_literal: true
require 'cgi'

# Metadata only: never mutate authored content or the publication boundary.
module PageMetadata
  CONTENT_LAYOUTS = %w[wiki review post].freeze

  def self.plain_text(body)
    text = body.to_s.dup
    # Remove executable/hidden content and syntax that is not explanatory prose.
    text.gsub!(%r{<(script|style|pre|code)\b[^>]*>.*?</\1>}im, ' ')
    text.gsub!(/^[ \t]*(`{3,}|~{3,})[^\n]*\n.*?^[ \t]*\1[^\n]*$/m, ' ')
    text.gsub!(/^(?: {4}|\t).*$/, ' ')
    text.gsub!(/`+[^`]*`+/, ' ')
    text.gsub!(/\{%.*?%\}|\{\{.*?\}\}/m, ' ')
    text.gsub!(/\{:[^}]*\}/, ' ')
    text.gsub!(/^\s*\#{1,6}\s+.*$/, ' ')
    text.gsub!(/^.*\n[=-]{3,}\s*$/, ' ')
    text.gsub!(/^\s*\[[^\]]+\]:.*$/, ' ')
    text.gsub!(/!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])/, ' ')
    text.gsub!(/\[\[([^\]]+)\]\]\{([^}]+)\}/, '\2')
    text.gsub!(/\[\[([^\]]+)\]\]/, '\1')
    text.gsub!(/\[([^\]]+)\](?:\([^)]*\)|\[[^\]]*\])/, '\1')
    text.gsub!(/<[^>]+>/m, ' ')
    text.gsub!(/^\s*(?:[-*+]\s+|\d+\.\s+|>\s*)/, '')
    text.gsub!(/[*_~|]/, '')
    CGI.unescapeHTML(text).gsub(/\s+/, ' ').strip
  end

  def self.description(data, body, fallback)
    %w[seo_description summary].each do |key|
      value = data[key].to_s.strip
      return value unless value.empty?
    end
    if CONTENT_LAYOUTS.include?(data['layout'])
      prose = plain_text(body)
      return prose.length > 160 ? prose[0, 159].rstrip + '…' : prose if prose.length >= 30
    end
    if data['layout'] == 'review'
      fields = %w[title author type genre].map { |key| data[key].to_s.strip }.reject(&:empty?)
      return fields.join(' · ') unless fields.empty?
    end
    # These labels describe existing catalog structure, not new commentary.
    index_description = {
      'reviews' => '책·음악·영상·웹툰 등 작품 리뷰 목록',
      'wikiindex' => '공개 위키 문서 목록'
    }[data['layout']]
    return index_description if index_description
    return '글과 연재 시리즈 목록' if data['url'] == '/posts/'
    fallback.to_s.strip
  end

  def self.prepare(page)
    metadata = page.data.merge('url' => page.url)
    page.data['meta_description'] = description(metadata, page.content, page.site.config['description'])
  end
end

Jekyll::Hooks.register [:pages, :documents], :pre_render do |page, payload|
  PageMetadata.prepare(page)
  # Jekyll 4.1 snapshots Page#to_liquid before this hook. Documents use a Drop,
  # but updating both payload types keeps the rendered metadata consistent.
  payload['page']['meta_description'] = page.data['meta_description'] if payload && payload['page']
end
