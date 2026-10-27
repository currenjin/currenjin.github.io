# frozen_string_literal: true
require 'minitest/autorun'
require 'bundler/setup'
require 'jekyll'

plugin = File.expand_path('../_plugins/readable_excerpt.rb', __dir__)
require plugin if File.exist?(plugin)

class ReadableExcerptTest < Minitest::Test
  def excerpt(body, length = 145)
    Liquid::Template.parse("{{ body | readable_excerpt: #{length} }}").render!('body' => body)
  end

  def test_adjacent_paragraphs_keep_a_word_boundary
    assert_equal 'Best Beat: m.A.A.d city Best Song: Sing About Me',
                 excerpt('<p>Best Beat: m.A.A.d city</p><p>Best Song: Sing About Me</p>')
  end

  def test_breaks_lists_and_block_elements_keep_separators
    assert_equal '첫째 둘째 셋째 넷째 다섯째',
                 excerpt('<div>첫째<br>둘째<br />셋째</div><ul><li>넷째</li><li>다섯째</li></ul>')
  end

  def test_inline_markup_does_not_invent_spaces_inside_words
    assert_equal 'hello &amp; 안녕', excerpt('<p><em>he</em>llo &amp; <strong>안녕</strong></p>')
  end

  def test_whitespace_is_normalized_before_truncation
    assert_equal 'alpha beta...', excerpt("<p>alpha</p>\n\n<p>beta gamma</p>", 13)
  end

  def test_empty_input_and_script_content
    assert_equal '', excerpt(nil)
    assert_equal '안녕 세계', excerpt('<p>안녕</p><script>alert(1)</script><p>세계</p>')
  end

  def test_the_real_card_template_uses_the_filter
    card = File.read(File.expand_path('../_includes/review-card.html', __dir__))
    assert_match(/r\.content\s*\|\s*readable_excerpt:\s*145/, card)
  end
end
