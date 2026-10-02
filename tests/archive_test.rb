require 'minitest/autorun'
require 'ostruct'
module Jekyll
  class Generator
    def self.safe(*); end
    def self.priority(*); end
  end
end
require_relative '../_plugins/archive'
class ArchiveTest < Minitest::Test
  NOW = Time.parse('2026-10-01T12:00:00+09:00')
  def doc(extra = {})
    OpenStruct.new(data: {'title'=>'Approved', 'public'=>true, 'date'=>'2026-09-01', 'updated'=>'2026-09-02'}.merge(extra), url:'/posts/chapters/test/')
  end
  def site(chapters = [], metadata = [])
    OpenStruct.new(collections: {'articles'=>OpenStruct.new(docs:[doc]), 'chapters'=>OpenStruct.new(docs:chapters)}, data:{'post_books'=>metadata}, config:{}, time:NOW)
  end
  def book(entries, extra = {})
    {'id'=>'approved-book', 'title'=>'Book', 'intro'=>'Intro', 'public'=>true, 'chapters'=>entries}.merge(extra)
  end
  def test_explicit_publication_and_dates
    assert CanonicalArchive.public_document?(doc, NOW)
    [{'public'=>false}, {'public'=>'true'}, {'public'=>nil}, {'published'=>false}, {'draft'=>true}, {'date'=>'2030-01-01'}, {'updated'=>'2030-01-01'}, {'updated'=>'2026-01-01'}, {'date'=>'invalid'}, {'date'=>nil}].each do |extra|
      refute CanonicalArchive.public_document?(doc(extra), NOW), extra.inspect
    end
  end
  def test_order_planned_drafts_and_orphans
    first = doc('book'=>'approved-book','chapter_id'=>'first','title'=>'First')
    last = doc('book'=>'approved-book','chapter_id'=>'last','title'=>'Last')
    draft = doc('book'=>'approved-book','chapter_id'=>'secret','public'=>false)
    orphan = doc('book'=>'missing-book','chapter_id'=>'orphan')
    s = site([last,draft,orphan,first], [book([{'id'=>'first','state'=>'published'}, {'id'=>'plan','state'=>'planned','title'=>'Planned'}, {'id'=>'secret','state'=>'published'}, {'id'=>'last','state'=>'published'}])])
    CanonicalArchive.prepare(s)
    assert_equal [last,first], s.collections['chapters'].docs
    assert_equal ['First','Planned','Last'], s.config['archive_books'][0]['chapters'].map { |c| c['title'] }
    assert_equal last, first.data['next_chapter']
    assert_equal first, last.data['previous_chapter']
    assert_nil first.data['previous_chapter']
    assert_nil last.data['next_chapter']
  end
  def test_empty_or_private_book_has_no_output
    [book([{'id'=>'plan','state'=>'planned','title'=>'Planned'}]), book([{'id'=>'first','state'=>'published'}], 'public'=>false)].each do |b|
      s = site([doc('book'=>'approved-book','chapter_id'=>'first')], [b])
      CanonicalArchive.prepare(s)
      assert_empty s.config['archive_books']
      assert_empty s.collections['chapters'].docs
    end
  end
  def test_explicit_planned_book_lists_only_approved_titles
    entries = [{'id'=>'plan','state'=>'planned','title'=>'Planned'}]
    extra = {'state'=>'planned','date'=>'2026-09-01','updated'=>'2026-09-02'}
    s = site([], [book(entries, extra)])
    CanonicalArchive.prepare(s)
    assert_equal ['Planned'], s.config['archive_books'].first.fetch('chapters').map { |c| c['title'] }
    assert_nil s.config['archive_books'].first['chapters'].first['url']
    assert_empty s.collections['chapters'].docs
    assert_equal 1, s.config['archive_documents'].size
    [{'public'=>false}, {'public'=>'true'}, {'date'=>'2030-01-01'}, {'updated'=>'2030-01-01'}, {'date'=>nil}, {'updated'=>'2026-01-01'}].each do |invalid|
      s = site([], [book(entries, extra.merge(invalid))])
      CanonicalArchive.prepare(s)
      assert_empty s.config['archive_books'], invalid.inspect
    end
    s = site([], [book([], extra)])
    CanonicalArchive.prepare(s)
    assert_empty s.config['archive_books']
  end
  def test_duplicate_ids_fail_closed
    b = book([{'id'=>'one','state'=>'planned','title'=>'One'}, {'id'=>'one','state'=>'planned','title'=>'Again'}])
    assert_raises(RuntimeError) { CanonicalArchive.prepare(site([], [b])) }
    assert_raises(RuntimeError) { CanonicalArchive.prepare(site([], [book([]),book([])])) }
  end
end
