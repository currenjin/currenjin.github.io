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

  def test_dates_are_strict_calendar_days
    invalid = [nil, '', 'invalid', '2026-02-30', '2026-1-2', 'October 18, 2026', '2026-10-18T00:00:00Z']
    assert_empty prepare(invalid.map { |date| entry('date'=>date) })
    assert_equal ['2026-10-20', '2026-10-18'], prepare([entry('date'=>Date.new(2026,10,18)), entry('id'=>'today', 'date'=>'2026-10-20')]).map { |item| item['date'] }
  end

  def test_partial_dates_preserve_precision_and_sort_unknown_periods_last
    dates = %w[2018 2018-01 2018-01-01 2018-07 2026 2026-10 2026-10-20]
    result = prepare(dates.map.with_index { |date, i| entry('id'=>"precision-#{i}", 'date'=>date) })
    assert_equal dates.sort.reverse, result.map { |item| item['date'] }
    assert_equal %w[day month year month day month year], result.map { |item| item['date_precision'] }
    assert_equal ['26-10-20', '26-10', '2026', '18-07', '18-01-01', '18-01', '2018'], result.map { |item| item['date_label'] }
    invalid = %w[2026-00 2026-13 2026-1 2026-02-30 0000 0000-01 20180 2018-01-01-01]
    assert_empty prepare(invalid.map { |date| entry('date'=>date) })
  end

  def test_future_public_activities_are_visible_at_every_date_precision
    dates = %w[2027 2026-11 2026-11-14]
    entries = dates.map.with_index { |date, i| entry('id'=>"planned-#{i}", 'date'=>date, 'result'=>'Planned') }
    result = prepare(entries + [entry])
    assert_equal dates.sort.reverse + ['2026-10-18'], result.map { |item| item['date'] }
    assert_equal ['Planned'] * 3, result.first(3).map { |item| item['result'] }
    hidden = [{'public'=>false}, {'public'=>'true'}, {'draft'=>true}, {'published'=>false}]
    assert_empty prepare(hidden.map { |extra| entries.first.merge(extra) })
  end

  def test_newest_first_without_mutating_source_or_exposing_extra_fields
    input = [entry('id'=>'older', 'date'=>'2026-09-19', 'private_note'=>'not public', 'source'=>'PRIVATE_PROVENANCE', 'kind'=>'company'), entry]
    result = prepare(input)
    assert_equal ['completed-event', 'older'], result.map { |item| item['id'] }
    assert_equal '/log/#completed-event', result.first['url']
    refute result.last.key?('private_note')
    refute result.last.key?('source')
    refute result.last.key?('kind')
    assert_equal 'older', input.first['id']
  end

  def test_invalid_rows_fail_closed_and_empty_data_is_supported
    assert_empty prepare(nil)
    assert_empty prepare({'unexpected'=>'mapping'})
    invalid = [nil, 'text', entry('id'=>'bad id'), entry('id'=>nil), entry('title'=>''), entry('title'=>123)]
    assert_empty prepare(invalid)
  end

  def test_summary_is_optional_without_reserving_empty_text
    [nil, '', ' ', 123, false, []].each do |summary|
      result = prepare([entry('summary'=>summary)])
      assert_equal 1, result.size
      refute result.first.key?('summary')
    end
    assert_equal 'Confirmed result.', prepare([entry]).first['summary']
  end

  def test_result_is_optional_and_only_nonempty_strings_are_exposed
    refute prepare([entry]).first.key?('result')
    [nil, '', '  ', 1, true, [], {'text'=>'Participant'}].each do |value|
      refute prepare([entry('result'=>value)]).first.key?('result'), value.inspect
    end
    ['1st Place', 'Top 6 Finalist', 'Participant', '<result> & confirmed'].each do |value|
      assert_equal value, prepare([entry('result'=>value)]).first['result']
    end
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
