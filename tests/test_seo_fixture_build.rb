# frozen_string_literal: true
# Real Jekyll fixture build; run with Jekyll on GEM_PATH (no Bundler/lock writes).
require 'jekyll'
require 'tmpdir'
require 'fileutils'
require 'json'
require 'yaml'
require 'cgi'
require 'rexml/document'
root = File.expand_path('..', __dir__)
Dir.mktmpdir('currenjin-seo-fixtures-') do |tmp|
  src = File.join(tmp, 'source')
  FileUtils.mkdir_p(src)
  Dir.children(root).reject { |name| name.start_with?('.') || %w[_site vendor node_modules].include?(name) }.each { |name| FileUtils.cp_r(File.join(root, name), src) }
  write_record = lambda do |collection, slug, data, body|
    directory = collection == 'chapters' ? '_post/books/seo-fixture' : "_#{collection}"
    FileUtils.mkdir_p(File.join(src, directory))
    File.write(File.join(src, directory, "#{slug}.md"), "---\n#{data.to_yaml.sub(/\A---\s*\n/, '')}---\n#{body}\n")
  end
  base = {'layout' => 'post', 'public' => true, 'date' => '2020-01-01', 'updated' => '2020-01-01'}
  labels = %w[private draft withdrawn future]
  %w[wiki reviews post chapters].each do |collection|
    {'private' => {'public' => false}, 'draft' => {'draft' => true}, 'withdrawn' => {'published' => false}, 'future' => {'date' => '2099-01-01', 'updated' => '2099-01-01'}}.each do |label, override|
      data = base.merge('layout' => collection == 'wiki' ? 'wiki' : collection == 'reviews' ? 'review' : 'post', 'title' => "SEO_SECRET_#{collection}_#{label}").merge(override)
      data.merge!('book' => 'seo-fixture', 'chapter_id' => "seo-#{label}") if collection == 'chapters'
      write_record.call(collection, "seo-#{label}", data, 'Secret body must not publish.')
    end
  end
  # Keep an old publication date and quoted future updated strings: YAML must
  # not pre-normalize the three formats that previously bypassed PublicSEO.
  future_formats = {'future-basic-offset' => '2099-01-01T00:00:00+0900',
                    'future-short-date' => '2099-1-1',
                    'future-space-offset' => '2099-01-01 00:00:00 +09:00'}
  %w[wiki reviews].each do |collection|
    future_formats.each do |label, value|
      data = base.merge('layout' => collection == 'wiki' ? 'wiki' : 'review',
                        'title' => "SEO_SECRET_#{collection}_#{label}")
      path = File.join(src, "_#{collection}", "seo-#{label}.md")
      frontmatter = data.to_yaml.sub(/\A---\s*\n/, '').sub(/^updated:.*$/, "updated: '#{value}'")
      File.write(path, "---\n#{frontmatter}---\nSecret future updated body.\n")
    end
  end
  # Real registered chapter sources: excluded chapters must not pass merely as orphans.
  book_path = File.join(src, '_data', 'post_books.yml')
  books = YAML.safe_load(File.read(book_path), permitted_classes: [Time, Date], aliases: true)
  books << {'id' => 'seo-fixture', 'title' => 'SEO fixture book', 'public' => true,
            'chapters' => (['good'] + labels).map { |id| {'id' => "seo-#{id}", 'title' => "Fixture #{id}", 'state' => 'published'} } +
                          [{'id' => 'seo-planned', 'title' => 'Fixture planned outline', 'state' => 'planned'}]}
  File.write(book_path, books.to_yaml)
  %w[good planned].each do |id|
    write_record.call('chapters', "seo-#{id}", base.merge('title' => "SEO_CHAPTER_#{id}", 'book' => 'seo-fixture', 'chapter_id' => "seo-#{id}", 'summary' => 'Existing authored chapter summary'), 'Existing public chapter prose.')
  end
  # Legacy public review, HTML-sensitive metadata and Korean canonical encoding.
  data = {'layout' => 'review', 'title' => 'SEO & "quoted"', 'seo_description' => 'Actual & "quoted" <source>', 'end_date' => '2026-01-01'}
  write_record.call('reviews', 'seo-한글', data, '')
  site = Jekyll::Site.new(Jekyll.configuration('source' => src, 'destination' => File.join(tmp, 'site'), 'plugins' => [], 'disable_disk_cache' => true, 'quiet' => true))
  site.process
  output = File.join(tmp, 'site')
  sitemap = File.read(File.join(output, 'sitemap.xml'))
  search = File.read(File.join(output, 'search-index.json'))
  home = File.read(File.join(output, 'index.html'))
  index = File.read(File.join(output, 'posts', 'index.html'))
  # Check actual rendered HTML, not only page.data or description unit helpers.
  {'posts/index.html' => '글과 연재 시리즈 목록', 'reviews/index.html' => '책·음악·영상·웹툰 등 작품 리뷰 목록',
   'index.html' => site.config['description'].strip,
   'posts/chapters/seo-fixture/seo-good/index.html' => 'Existing authored chapter summary'}.each do |path, expected|
    html = File.read(File.join(output, path))
    %w[description og:description twitter:description].each do |key|
      values = html.scan(/<meta (?:name|property)="#{Regexp.escape(key)}" content="([^"]*)">/).flatten.map { |value| CGI.unescapeHTML(value) }
      raise "Rendered description mismatch #{path}/#{key}: #{values.inspect}" unless values == [expected]
    end
  end
  %w[wiki reviews post chapters].each do |collection|
    ((%w[wiki reviews].include?(collection) ? future_formats.keys : []) + labels).each do |label|
      prefix = collection == 'post' ? 'posts' : collection == 'chapters' ? 'posts/chapters/seo-fixture' : collection
      raise "Secret leaked #{collection}/#{label}" if [sitemap, search, home, index].any? { |text| text.include?("SEO_SECRET_#{collection}_#{label}") || text.include?("/#{prefix}/seo-#{label}/") }
      raise 'Private generated file' if File.exist?(File.join(output, prefix, "seo-#{label}", 'index.html'))
    end
  end
  planned_url = '/posts/chapters/seo-fixture/seo-planned/'
  raise 'Planned source generated' if File.exist?(File.join(output, planned_url, 'index.html'))
  raise 'Planned chapter source leaked' if [sitemap, search, home, index].any? { |text| text.include?(planned_url) || text.include?('SEO_CHAPTER_planned') }
  good_url = '/posts/chapters/seo-fixture/seo-good/'
  locs = REXML::XPath.match(REXML::Document.new(sitemap), '//url/loc').map(&:text)
  raise 'Published chapter sitemap count' unless locs.count("https://currenjin.github.io#{good_url}") == 1
  raise 'Published chapter absent from search' unless JSON.parse(search).count { |entry| entry['url'] == good_url } == 1
  raise 'Published chapter absent from home/index' unless [home, index].all? { |html| html.include?(good_url) && html.include?('SEO_CHAPTER_good') }
  html = File.read(File.join(output, 'reviews', 'seo-한글', 'index.html'))
  raise 'Metadata not escaped' unless html.include?('Actual &amp; &quot;quoted&quot; &lt;source&gt;')
  raise 'Korean canonical not encoded' unless html.include?('/reviews/seo-%ED%95%9C%EA%B8%80/')
  entry = sitemap.match(%r{<url>\s*<loc>[^<]*/reviews/seo-%ED%95%9C%EA%B8%80/</loc>(.*?)</url>}m)
  raise 'Legacy review absent' unless entry
  raise 'Synthetic/end_date lastmod leaked' if entry[1].include?('lastmod')
  # Run the independent verifier against this scratch source inventory too.
  raise 'Fixture SEO verifier failed' unless system({'PYTHONDONTWRITEBYTECODE' => '1'}, 'python3', File.join(src, 'tests', 'verify_seo.py'), output)
  puts 'Fixture PASS: 16 registered private/draft/withdrawn/future records, 6 quoted future-updated wiki/reviews (3 formats each) and 1 planned chapter source absent from files, home, search, sitemap, posts index; published chapter generated, sitemap once, search/home/index present; rendered index/home/explicit descriptions preserved; legacy public Korean review encoded and escaped; synthetic/end_date lastmod omitted'
end
