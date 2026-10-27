# frozen_string_literal: true

# Keep authored block boundaries when deriving single-line review card copy.
# Inline markup is stripped without inserting spaces inside a word.
module ReadableExcerpt
  module Filters
    def readable_excerpt(input, length = 145)
      separated = input.to_s.gsub(%r{</?(?:address|article|aside|blockquote|br|dd|div|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|th|thead|tr|ul)\b[^>]*>}i, ' ')
      text = strip_html(separated).gsub(/[[:space:]]+/, ' ').strip
      truncate(text, length)
    end
  end

  Liquid::Template.register_filter(Filters) if defined?(Liquid::Template)
end
