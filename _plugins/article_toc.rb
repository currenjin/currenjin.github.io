# frozen_string_literal: true
require 'kramdown'
require 'cgi'
module ArticleToc
  def self.text(element)
    return element.value.code_point.chr(Encoding::UTF_8) if element.type == :entity
    return element.value.to_s if %i[text codespan].include?(element.type)
    element.children.map { |child| text(child) }.join
  end

  module Filters
    # Parse rendered HTML with Jekyll's existing parser, but NEVER serialize the
    # body again. Read original IDs and prefix only navigation; no new gems.
    def article_toc(input, enabled = true)
      return input if enabled.equal?(false)
      tree = Kramdown::Document.new(input, input: 'html').root
      headings = []
      existing = false
      visit = lambda do |element|
        existing = true if element.attr['id'] == 'markdown-toc'
        headings << element if element.type == :header && element.attr['id']
        element.children.each { |child| visit.call(child) }
      end
      visit.call(tree)
      return input if existing || headings.empty?
      root = { level: 0, items: [] }
      stack = [root]
      headings.each do |heading|
        level = heading.options.fetch(:level)
        stack.pop while stack.length > 1 && level < stack.last[:level]
        if level > stack.last[:level] && !stack.last[:items].empty?
          nested = stack.last[:items].last[:nested] || { level: level, items: [] }
          nested[:level] = level
          stack.last[:items].last[:nested] = nested
          stack << nested
        else
          stack.last[:level] = level
        end
        stack.last[:items] << { id: heading.attr['id'], title: ArticleToc.text(heading) }
      end
      render = lambda do |list, top|
        "<ul#{top ? ' id="markdown-toc"' : ''}>" + list[:items].map do |item|
          id = CGI.escapeHTML(item[:id])
          '<li><a href="#' + id + '" id="markdown-toc-' + id + '">' + CGI.escapeHTML(item[:title]) + '</a>' +
            (item[:nested] ? render.call(item[:nested], false) : '') + '</li>'
        end.join + '</ul>'
      end
      render.call(root, true) + "\n" + input
    end
  end
  Liquid::Template.register_filter(Filters) if defined?(Liquid::Template)
end
