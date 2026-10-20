require 'minitest/autorun'
require 'ostruct'
require 'date'
module Jekyll
  class Generator
    def self.safe(*); end
    def self.priority(*); end
  end
end
plugin = File.expand_path('../_plugins/activity_log.rb', __dir__)
require plugin if File.exist?(plugin)

class ActivityLogTest < Minitest::Test
  NOW = Time.new(2026, 10, 20, 0, 0, 0, '+09:00')

  def entry(extra = {})
    {'id'=>'completed-event', 'date'=>'2026-10-18', 'public'=>true,
     'title'=>'Completed event', 'summary'=>'Confirmed result.'}.merge(extra)
  end

  def prepare(entries)
    site = OpenStruct.new(data: {'activity_log'=>entries}, config: {}, time: NOW)
    assert defined?(ActivityLog::Generator), 'Activity log publication generator is missing'
    ActivityLog::Generator.new.generate(site)
    site.config.fetch('activity_log')
  end

  def test_only_explicit_public_non_draft_entries_are_exposed
    invalid = [{'public'=>false}, {'public'=>'true'}, {'public'=>nil},
               {'draft'=>true}, {'published'=>false}]
    assert_equal ['completed-event'], prepare([entry] + invalid.map { |extra| entry(extra) }).map { |item| item['id'] }
  end

  def test_dates_are_strict_calendar_days_and_not_future_in_site_timezone
    invalid = [nil, '', 'invalid', '2026-02-30', '2026-10-21', '2026-1-2', 'October 18, 2026', '2026-10-18T00:00:00Z']
    assert_empty prepare(invalid.map { |date| entry('date'=>date) })
    assert_equal ['2026-10-20', '2026-10-18'], prepare([entry('date'=>Date.new(2026,10,18)), entry('id'=>'today', 'date'=>'2026-10-20')]).map { |item| item['date'] }
  end

  def test_newest_first_without_mutating_source_or_exposing_extra_fields
    input = [entry('id'=>'older', 'date'=>'2026-09-19', 'private_note'=>'not public'), entry]
    result = prepare(input)
    assert_equal ['completed-event', 'older'], result.map { |item| item['id'] }
    assert_equal '/log/#completed-event', result.first['url']
    refute result.last.key?('private_note')
    assert_equal 'older', input.first['id']
  end

  def test_invalid_rows_fail_closed_and_empty_data_is_supported
    assert_empty prepare(nil)
    assert_empty prepare({'unexpected'=>'mapping'})
    invalid = [nil, 'text', entry('id'=>'bad id'), entry('id'=>nil), entry('title'=>''), entry('summary'=>' '), entry('title'=>123)]
    assert_empty prepare(invalid)
  end

  def test_project_link_is_optional_and_unsafe_urls_are_not_rendered
    assert_nil prepare([entry]).first['project_url']
    ['javascript:alert(1)', '//example.org', 'https://', 'https://user:secret@example.org/repo'].each do |url|
      assert_nil prepare([entry('project_url'=>url)]).first['project_url'], url
    end
    url = 'https://github.com/currenjin/2026-10-daytona-hack-sprint'
    assert_equal url, prepare([entry('project_url'=>url)]).first['project_url']
  end
end
