require 'minitest/autorun'
# CI's bundled dependencies live outside Ruby's global gem path. Load the
# standard-library test runner first, then activate the existing Jekyll bundle.
require 'bundler/setup'
require_relative '../_plugins/article_toc'
class ArticleTocTest < Minitest::Test
  include ArticleToc::Filters
  def test_generates_from_rendered_headings_without_changing_body
    body = '<h2 id="original">Original &amp; exact</h2><p>Question bytes.</p><h3 id="child">Child</h3><h2 id="next">Next</h2>'
    result = article_toc(body)
    assert result.end_with?(body)
    tree = Kramdown::Document.new(result, input: 'html').root
    links = []
    visit = lambda { |e| links << e if e.type == :a; e.children.each { |c| visit.call(c) } }
    visit.call(tree)
    assert_equal %w[original child next], links.map { |a| a.attr['href'].delete_prefix('#') }
    assert_equal 'markdown-toc-child', links[1].attr['id']
    assert_equal 'Original & exact', ArticleToc.text(links.first)
  end
  def test_skipped_heading_levels_do_not_drop_links
    body = '<h2 id="a">A</h2><h4 id="b">B</h4><h3 id="c">C</h3><h4 id="d">D</h4><h2 id="e">E</h2>'
    result = article_toc(body)
    assert_equal %w[a b c d e], result.scan(/href="#([^"]+)"/).flatten
    assert result.end_with?(body)
  end
  def test_existing_wiki_toc_and_explicit_opt_out_are_byte_identical
    body = '<ul id="markdown-toc"><li>Authored</li></ul><h2 id="keep">Keep</h2>'
    assert_equal body, article_toc(body)
    assert_equal '<h2 id="keep">Keep</h2>', article_toc('<h2 id="keep">Keep</h2>', false)
    assert_equal '<p>No headings</p>', article_toc('<p>No headings</p>')
  end
end
