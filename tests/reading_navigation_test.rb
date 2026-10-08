require_relative 'archive_test'
require 'tmpdir'
class ReadingNavigationTest < ArchiveTest
  def wiki(name, extra = {})
    document = doc({'title'=>name, 'series'=>'fixture'}.merge(extra))
    document.relative_path = "_wiki/#{name}.md"
    document.url = "/wiki/#{name}/"
    document
  end
  def wiki_site(documents, extra = {}, members = %w[first secret last])
    s = site
    s.collections['wiki'] = OpenStruct.new(docs: documents)
    s.data['wiki_series'] = [{'id'=>'fixture', 'title'=>'Fixture series', 'public'=>true,
      'chapters'=>members.map { |name| {'id'=>name, 'state'=>'published'} }}.merge(extra)]
    s
  end
  def test_common_post_contract_preserves_existing_book_navigation
    first = doc('book'=>'approved-book','chapter_id'=>'first')
    last = doc('book'=>'approved-book','chapter_id'=>'last')
    s = site([first,last], [book([{'id'=>'first','state'=>'published'}, {'id'=>'last','state'=>'published'}])])
    CanonicalArchive.prepare(s)
    assert_equal 'Book', first.data.fetch('reading_series').fetch('title')
    assert_equal last.url, first.data.fetch('reading_next').fetch('url')
    assert_equal first.url, last.data.fetch('reading_previous').fetch('url')
    assert_nil s.collections['post'].docs.first.data['reading_series']
    assert_equal last, first.data['next_chapter']
  end
  def test_wiki_scratch_membership_order_and_private_exclusion
    Dir.mktmpdir('wiki-series-') do |root|
      first, secret, last = wiki('first'), wiki('secret', 'public'=>false), wiki('last')
      [first,secret,last].each do |document|
        File.write(File.join(root, File.basename(document.relative_path)), document.data.inspect)
      end
      s = wiki_site([last,secret,first])
      CanonicalArchive.prepare(s)
      assert_equal %w[first last], first.data.fetch('reading_series').fetch('chapters').map { |c| c['title'] }
      assert_equal last.url, first.data.fetch('reading_next').fetch('url')
      assert_equal first.url, last.data.fetch('reading_previous').fetch('url')
      refute_includes s.collections['wiki'].docs, secret
    end
  end
  def test_wiki_membership_fails_closed_and_standalone_is_unchanged
    [{'public'=>false}, {'public'=>'true'}, {'draft'=>true}, {'published'=>false}].each do |extra|
      chapter = wiki('first')
      s = wiki_site([chapter], extra)
      CanonicalArchive.prepare(s)
      refute_includes s.collections['wiki'].docs, chapter
    end
    [false, 'true', nil].each do |public_value|
      chapter = wiki('first', 'public'=>public_value)
      s = wiki_site([chapter])
      CanonicalArchive.prepare(s)
      refute_includes s.collections['wiki'].docs, chapter
    end
    orphan = wiki('orphan')
    mismatch = wiki('different'); mismatch.data['series'] = 'fixture'
    standalone = wiki('standalone'); standalone.data.delete('series')
    s = wiki_site([orphan,mismatch,standalone])
    CanonicalArchive.prepare(s)
    assert_equal [standalone], s.collections['wiki'].docs
    assert_nil standalone.data['reading_series']
  end
  def test_wiki_duplicate_members_and_sources_abort
    assert_raises(RuntimeError) { CanonicalArchive.prepare(wiki_site([wiki('first')], {}, %w[first first])) }
    assert_raises(RuntimeError) { CanonicalArchive.prepare(wiki_site([wiki('first'),wiki('first')])) }
  end
end
