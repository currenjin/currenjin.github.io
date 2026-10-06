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
    OpenStruct.new(data: {'title'=>'Approved', 'public'=>true, 'date'=>'2026-09-01', 'updated'=>'2026-09-02'}.merge(extra), url:'/posts/chapters/test/', relative_path: extra['book'] ? "_post/books/#{extra['book']}/#{extra['chapter_id']}.md" : '_post/approved.md')
  end
  def site(chapters = [], metadata = [])
    OpenStruct.new(collections: {'post'=>OpenStruct.new(docs:[doc] + chapters)}, data:{'post_books'=>metadata}, config:{}, time:NOW)
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
    assert_equal [last,first], s.collections['post'].docs.select { |document| document.data['book'] }
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
      assert_empty s.collections['post'].docs.select { |document| document.data['book'] }
    end
  end
  def test_explicit_planned_book_lists_only_approved_titles
    entries = [{'id'=>'plan','state'=>'planned','title'=>'Planned'}]
    extra = {'state'=>'planned','date'=>'2026-09-01','updated'=>'2026-09-02'}
    s = site([], [book(entries, extra)])
    CanonicalArchive.prepare(s)
    assert_equal ['Planned'], s.config['archive_books'].first.fetch('chapters').map { |c| c['title'] }
    assert_nil s.config['archive_books'].first['chapters'].first['url']
    assert_empty s.collections['post'].docs.select { |document| document.data['book'] }
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
  def test_mixed_catalog_uses_series_update_and_article_initial_date
    planned = book([{'id'=>'outline','state'=>'planned','title'=>'Outline'}],
                   'state'=>'planned','date'=>'2026-09-01','updated'=>'2026-09-15')
    s = site([], [planned])
    s.collections['post'].docs = [doc('title'=>'Old','date'=>'2026-09-01','updated'=>'2026-09-29'),
                                      doc('title'=>'New','date'=>'2026-09-20','updated'=>'2026-09-20')]
    CanonicalArchive.prepare(s)
    assert_equal ['article','series','article'], s.config['archive_catalog'].map { |entry| entry['kind'] }
    assert_equal ['2026-09-20','2026-09-15','2026-09-01'], s.config['archive_catalog'].map { |entry| entry['date'].strftime('%Y-%m-%d') }
    assert_equal 'New', s.config['archive_catalog'].first['document'].data['title']
  end
  def test_routes_preserve_public_urls_without_editing_sources
    article = doc
    chapter = doc('book'=>'approved-book', 'chapter_id'=>'first')
    s = site([chapter], [book([{'id'=>'first','state'=>'published'}])])
    s.collections['post'].docs[0] = article
    CanonicalArchive.prepare(s)
    assert_equal '/posts/approved/', article.data['permalink']
    assert_equal '/posts/chapters/approved-book/first/', chapter.data['permalink']
    assert_equal [article,chapter], s.config['archive_documents']
  end
  def test_reserved_book_directory_cannot_publish_as_an_independent_article
    orphan = doc
    orphan.relative_path = '_post/books/secret/missing-metadata.md'
    s = site
    s.collections['post'].docs << orphan
    CanonicalArchive.prepare(s)
    refute_includes s.collections['post'].docs, orphan
  end
  def test_explicit_article_permalink_is_preserved
    article = doc('permalink'=>'/posts/existing/')
    s = site
    s.collections['post'].docs = [article]
    CanonicalArchive.prepare(s)
    assert_equal '/posts/existing/', article.data['permalink']
  end
  def test_chapter_path_must_match_approved_book_and_chapter_metadata
    ['_post/books/private-book/private-chapter.md', '_post/books/approved-book/wrong.md', '_post/outside-books.md'].each do |path|
      chapter = doc('book'=>'approved-book', 'chapter_id'=>'first')
      chapter.relative_path = path
      s = site([chapter], [book([{'id'=>'first','state'=>'published'}])])
      CanonicalArchive.prepare(s)
      refute_includes s.collections['post'].docs, chapter, path
      assert_empty s.config['archive_books'], path
    end
  end
  def test_duplicate_ids_fail_closed
    b = book([{'id'=>'one','state'=>'planned','title'=>'One'}, {'id'=>'one','state'=>'planned','title'=>'Again'}])
    assert_raises(RuntimeError) { CanonicalArchive.prepare(site([], [b])) }
    assert_raises(RuntimeError) { CanonicalArchive.prepare(site([], [book([]),book([])])) }
  end
end
