# frozen_string_literal: true
require 'kramdown-parser-gfm'

module Kramdown
  module Parser
    class WikiGFM < GFM
      BACKLINK = %r{\[\[/?([\p{L}\p{N}_.-]+(?:/[\p{L}\p{N}_.-]+)*)\]\](?:\{([^{}\n]+)\})?}

      def initialize(source, options)
        super
        @span_parsers.insert(@span_parsers.index(:link), :wiki_backlink)
      end

      def parse
        super
        return unless @options[:auto_ids]

        current = headings(@root)
        return unless current.any? { |heading| contains_backlink?(heading) }

        # Keep the IDs produced by ordinary GFM, including duplicate suffixes.
        original, = GFM.parse(@source, @options.dup)
        current.zip(headings(original)).each do |updated, prior|
          next unless prior

          updated.attr['id'] = prior.attr.fetch('id') if prior.attr.key?('id')
          # The HTML converter generates IDs itself inside raw HTML blocks.
          updated.options[:raw_text] = prior.options.fetch(:raw_text)
        end
      end

      def parse_wiki_backlink
        slug, label = @src[1], @src[2]
        href = @options.fetch(:wiki_backlink_urls)[slug]
        ancestors = [@tree, *@stack.map(&:first)].compact
        inside_link = ancestors.any? do |node|
          %i[a img].include?(node.type) || (node.type == :html_element && node.value == 'a')
        end
        return parse_link if !href || inside_link
        return parse_link if !label && markdown_link_suffix?(@src[0], @src.rest.byteslice(@src.matched_size..-1))

        link = Element.new(:a, nil, { 'href' => href }, wiki_backlink: true)
        link.children << Element.new(:text, label || slug)
        @tree.children << link
        @src.pos += @src.matched_size
        true
      end
      define_parser(:wiki_backlink, BACKLINK, '\\[\\[')

      private

      def markdown_link_suffix?(token, suffix)
        return true if suffix.start_with?('(')

        reference = suffix.match(/\A#{LINK_INLINE_ID_RE}/)
        id = reference && !reference[1].empty? ? reference[1] : token[1...-1]
        @link_defs.key?(normalize_link_id(id))
      end

      def headings(node)
        return [node] if node.type == :header

        node.children.flat_map { |child| headings(child) }
      end

      def contains_backlink?(node)
        node.options[:wiki_backlink] || node.children.any? { |child| contains_backlink?(child) }
      end
    end
  end
end

module WikiBacklinks
  # Non-Wiki documents keep Jekyll's default Markdown converter.
  def converters
    return super unless document.is_a?(Jekyll::Document) && document.collection.label == 'wiki'

    @wiki_backlink_converters ||= super.map do |converter|
      next converter unless converter.is_a?(Jekyll::Converters::Markdown)

      urls = document.collection.docs.to_h do |target|
        slug = target.relative_path.delete_prefix('_wiki/').delete_suffix(target.extname)
        [slug, site.config['baseurl'].to_s + target.url.sub(/index\.html\z/, '')]
      end
      options = site.config.fetch('kramdown').merge('input' => 'WikiGFM', 'wiki_backlink_urls' => urls)
      Jekyll::Converters::Markdown.new(site.config.merge('kramdown' => options))
    end
  end
end

Jekyll::Renderer.prepend(WikiBacklinks)