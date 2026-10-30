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
   {'date'=>'2026-00'}, {'date'=>'2026-13'}, {'date'=>'0000'}, {'date'=>'2026-02-30'}, {'date'=>'invalid'}, {'date'=>nil}].each_with_index do |extra, i|
    entries << good.merge('id'=>"secret-#{i}", 'title'=>"LOG_FIXTURE_SECRET_#{i}").merge(extra)
  end
  entries.first['result'] = '<result> & confirmed'
  entries.last['result'] = 'PRIVATE_RESULT'
  entries[1]['result'] = 'Participant'
  invalid_results = [nil, '', ' ', 123, false, [], {'text'=>'invalid'}]
  invalid_results.each_with_index do |value, i|
    entries << good.merge('id'=>"invalid-result-#{i}", 'result'=>value)
  end
  entries << good.merge('id'=>'without-result', 'title'=>'Complete title - Project', 'summary'=>nil, 'result'=>nil)
  entries << good.merge('id'=>'year-only', 'date'=>'2018', 'result'=>'Gold Medal', 'summary'=>nil)
  entries << good.merge('id'=>'month-only', 'date'=>'2018-07', 'result'=>nil, 'summary'=>nil)
  %w[2027 2026-11 2026-11-14].each_with_index do |date, i|
    entries << good.merge('id'=>"planned-#{i}", 'date'=>date, 'title'=>"LOG_FIXTURE_PLANNED_#{i}", 'summary'=>nil, 'result'=>'Upcoming')
  end
  ['Certification', 'Software Engineer', '1st Place'].each_with_index do |result, i|
    entries << good.merge('id'=>"emphasis-#{i}", 'result'=>result, 'summary'=>nil)
  end
  public_count = 11 + invalid_results.size
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
  raise 'Wrong public search count' unless search.size == public_count && search.all? { |item| item['type'] == 'log' }
  raise 'Log IDs absent from search' unless search.map { |item| item['url'] }.sort == entries.select { |item| !item['id'].start_with?('secret-') }.map { |item| '/log/#' + item['id'] }.sort
  [home, log].each do |html|
    raise 'Secret activity leaked' if html.include?('LOG_FIXTURE_SECRET')
    raise 'Public count mismatch' unless html.scan('data-kind="log"').size == public_count
    raise 'Result not escaped or not adjacent to title' unless html.include?('LOG_FIXTURE_PUBLIC &amp; &lt;title&gt; <span class="activity-result">&lt;result&gt; &amp; confirmed</span><small>')
    raise 'Participant not understated' unless html.include?('<span class="activity-result activity-result--participant">Participant</span>')
    raise 'Invalid/absent results reserved space' unless html.scan('class="activity-result').size == 9
    ['Gold Medal', '1st Place'].each do |result|
      raise 'Confirmed achievement not emphasized' unless html.include?("<span class=\"activity-result activity-result--achievement\">#{result}</span>")
    end
    ['Upcoming', 'Certification', 'Software Engineer'].each do |result|
      raise 'Ordinary label incorrectly emphasized' unless html.include?("<span class=\"activity-result\">#{result}</span>")
    end
    raise 'Unknown result automatically emphasized' unless html.scan('activity-result--achievement').size == 2
    %w[0 1 2].each do |i|
      raise 'Future public activity missing' unless html.include?("LOG_FIXTURE_PLANNED_#{i} <span class=\"activity-result\">Upcoming</span>")
    end
    raise 'Future activity not sorted before completed activity' unless html.index('id="planned-2"') < html.index('id="fixture-good"')
    raise 'Optional summary reserved space' unless html.match?(%r{<span class="entry-title">Complete title - Project</span>})
    raise 'Year-only date became a fabricated day' unless html.match?(%r{id="year-only"[^>]*data-date="2018"[^>]*>\s*<span class="date">2018</span>}m)
    raise 'Month-only date lost its precision' unless html.match?(%r{id="month-only"[^>]*data-date="2018-07"[^>]*>\s*<time class="date" datetime="2018-07">18-07</time>}m)
    raise 'Private result leaked' if html.include?('PRIVATE_RESULT')
    raise 'Title not escaped' unless html.include?('LOG_FIXTURE_PUBLIC &amp; &lt;title&gt;')
    raise 'Summary not escaped' unless html.include?('Confirmed &lt;text&gt; &amp; result.')
    raise 'Projectless entry is not plain text' unless html.match?(%r{id="fixture-good"[^>]*>\s*<time.*?<span class="entry-title">LOG_FIXTURE_PUBLIC}m)
    raise 'Optional project link missing' unless html.include?('<a class="entry-link" href="https://github.com/currenjin">')
    raise 'Linked row does not include summary' unless html.match?(%r{<a class="entry-link" href="https://github.com/currenjin">.*?<time.*?<small>.*?</small></span>\s*</a>}m)
  end
  raise 'Missing summary is not empty search text' unless search.find { |item| item['url']=='/log/#without-result' }['summary']==''
  raise 'Search date precision changed' unless search.find { |item| item['url']=='/log/#year-only' }['updated']=='2018' && search.find { |item| item['url']=='/log/#month-only' }['updated']=='2018-07'
  raise 'Home count includes excluded activity' unless home.include?("data-result-count>#{public_count} / #{public_count}</span>")
  raise 'Log archive not newest first' unless log.index('id="fixture-good"') < log.index('id="fixture-older"')
  raise 'Log navigation not current' unless log.match?(%r{href="/log/" aria-current="page">log</a>})
  raise 'Activity became graph nodes' if graph.include?('LOG_FIXTURE')
  puts 'Activity fixture PASS: real Home/log/search expose future public activities, 11 excluded; strict source date precision; optional/invalid/escaped results; escaped text, projectless title, optional link, newest-first archive, current navigation, no graph nodes'
end
