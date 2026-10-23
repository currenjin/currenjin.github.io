require 'minitest/autorun'
require 'liquid'

class AiDisclosureTest < Minitest::Test
  ROOT = File.expand_path('..', __dir__)
  GENERATED = '이 문서의 본문 대부분은 생성형 AI가 작성했습니다.'
  REVIEWED = '작성자가 내용을 검토하고 수정했습니다.'
  UNREVIEWED = '아직 작성자의 충분한 사실 검증을 거치지 않았습니다.'
  ASSISTED = '작성자의 원자료를 바탕으로 생성형 AI가 구조와 문장을 편집했습니다.'

  def render(level, reviewed)
    Liquid::Template.parse(File.read(File.join(ROOT, '_includes/ai-disclosure.html')))
      .render!('include' => {'ai' => {'level' => level, 'reviewed' => reviewed}, 'context' => 'catalog'})
  end

  def test_generated_true_preserves_both_sentences
    html = render('generated', true)
    assert_includes html, GENERATED + ' ' + REVIEWED
    refute_includes html, UNREVIEWED
    assert_includes html, 'class="ai-disclosure ai-disclosure--catalog"'
    assert_includes html, '<summary aria-label="AI 사용 정보 보기">AI</summary>'
  end

  def test_generated_false_does_not_claim_human_review
    html = render('generated', false)
    assert_includes html, GENERATED
    assert_includes html, UNREVIEWED
    refute_includes html, REVIEWED
  end

  def test_missing_review_defaults_to_false
    html = render('generated', nil)
    assert_includes html, GENERATED
    assert_includes html, UNREVIEWED
    refute_includes html, REVIEWED
  end

  def test_assisted_true_is_unchanged
    html = render('assisted', true)
    assert_includes html, ASSISTED
    refute_includes html, GENERATED
    refute_includes html, REVIEWED
    refute_includes html, UNREVIEWED
  end

  def test_assisted_false_keeps_warning
    html = render('assisted', false)
    assert_includes html, ASSISTED
    assert_includes html, UNREVIEWED
    refute_includes html, GENERATED
    refute_includes html, REVIEWED
  end
end
