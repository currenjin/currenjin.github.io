# frozen_string_literal: true
# Real publication boundary through the production Home, /log/ and search views.
require 'jekyll'
require 'tmpdir'
require 'fileutils'
require 'json'
require 'yaml'
require 'cgi'
root = File.expand_path('..', __dir__)
cache = File.join(root, '.jekyll-cache')
FileUtils.mkdir_p(cache)
Dir.mktmpdir('activity-log-fixture-', cache) do |tmp|
  src = File.join(tmp, 'source')
  FileUtils.mkdir_p(src)
  # Copy only the templates needed by this fixture, not the authored inventory.
  %w[_layouts _includes].each { |name| FileUtils.cp_r(File.join(root, name), src) }
  %w[index.html log.html search-index.json graph-data.json].each { |name| FileUtils.cp(File.join(root, name), src) }
  FileUtils.mkdir_p(File.join(src, '_plugins'))
  FileUtils.cp(File.join(root, '_plugins/activity_log.rb'), File.join(src, '_plugins'))
  FileUtils.mkdir_p(File.join(src, '_data'))
  FileUtils.mkdir_p(File.join(src, '_wiki'))
  File.write(File.join(src, '_wiki/index.md'), "---\ntitle: wiki\npublic: true\n---\n")
  good = {'id'=>'fixture-good', 'date'=>'2026-10-18', 'public'=>true,
          'title'=>'LOG_FIXTURE_PUBLIC & <title>', 'summary'=>'Confirmed <text> & result.'}
  entries = [good, good.merge('id'=>'fixture-older', 'date'=>'2026-09-01', 'title'=>'LOG_FIXTURE_OLDER', 'project_url'=>'https://github.com/currenjin')]
  [{'public'=>false}, {'public'=>'true'}, {'public'=>nil}, {'draft'=>true}, {'published'=>false},
   {'date'=>'2099-01-01'}, {'date'=>'2026-02-30'}, {'date'=>'invalid'}, {'date'=>nil}].each_with_index do |extra, i|
    entries << good.merge('id'=>"secret-#{i}", 'title'=>"LOG_FIXTURE_SECRET_#{i}").merge(extra)
  end
  File.write(File.join(src, '_data/activity_log.yml'), entries.to_yaml)
  config = {'source'=>src, 'destination'=>File.join(tmp, 'site'), 'plugins'=>[], 'quiet'=>true,
            'disable_disk_cache'=>true, 'time'=>Time.new(2026,10,20,0,0,0,'+09:00'), 'timezone'=>'Asia/Seoul',
            'url'=>'https://currenjin.github.io', 'baseurl'=>'', 'title'=>'Fixture', 'description'=>'Fixture archive',
            'archive_articles'=>[], 'archive_books'=>[], 'archive_documents'=>[], 'collections'=>{'wiki'=>{}, 'reviews'=>{}}}
  Jekyll::Site.new(Jekyll.configuration(config)).process
  output = File.join(tmp, 'site')
  home = File.read(File.join(output, 'index.html'))
  log = File.read(File.join(output, 'log/index.html'))
  search = JSON.parse(File.read(File.join(output, 'search-index.json')))
  graph = File.read(File.join(output, 'graph-data.json'))
  raise 'Wrong public search count' unless search.size == 2 && search.all? { |item| item['type'] == 'log' }
  raise 'Log IDs absent from search' unless search.map { |item| item['url'] }.sort == %w[/log/#fixture-good /log/#fixture-older].sort
  [home, log].each do |html|
    raise 'Secret activity leaked' if html.include?('LOG_FIXTURE_SECRET')
    raise 'Public count mismatch' unless html.scan('data-kind="log"').size == 2
    raise 'Title not escaped' unless html.include?('LOG_FIXTURE_PUBLIC &amp; &lt;title&gt;')
    raise 'Summary not escaped' unless html.include?('Confirmed &lt;text&gt; &amp; result.')
    raise 'Projectless entry is not plain text' unless html.match?(%r{id="fixture-good"[^>]*>\s*<time.*?<span class="entry-title">LOG_FIXTURE_PUBLIC}m)
    raise 'Optional project link missing' unless html.include?('<a class="entry-link" href="https://github.com/currenjin">')
    raise 'Linked row does not include summary' unless html.match?(%r{<a class="entry-link" href="https://github.com/currenjin">.*?<time.*?<small>.*?</small></span>\s*</a>}m)
  end
  raise 'Home count includes excluded activity' unless home.include?('data-result-count>2 / 2</span>')
  raise 'Log archive not newest first' unless log.index('id="fixture-good"') < log.index('id="fixture-older"')
  raise 'Log navigation not current' unless log.match?(%r{href="/log/" aria-current="page">log</a>})
  raise 'Activity became graph nodes' if graph.include?('LOG_FIXTURE')
  puts 'Activity fixture PASS: real Home/log/search expose only 2 valid public entries, 9 excluded; escaped text, projectless title, optional link, newest-first archive, current navigation, no graph nodes'
end
