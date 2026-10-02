# frozen_string_literal: true
require 'minitest/autorun'
require 'ostruct'
module Jekyll
  class Generator
    def self.safe(*); end
    def self.priority(*); end
  end
end
PLUGIN = File.expand_path('../_plugins/public_seo.rb', __dir__)
load PLUGIN if File.exist?(PLUGIN)
class PublicSitemapTest < Minitest::Test
  def setup
    assert defined?(PublicSEO), 'Missing public sitemap/publication boundary implementation'
  end
  def doc(data = {}, url = '/wiki/test/')
    OpenStruct.new(data: data, url: url)
  end
  def test_legacy_public_semantics_and_withdrawal
    now = Time.utc(2026, 10, 2)
    assert PublicSEO.public_document?(doc, now)
    %w[public published].each { |key| refute PublicSEO.public_document?(doc(key => false), now) }
    refute PublicSEO.public_document?(doc('draft' => true), now)
    refute PublicSEO.public_document?(doc('date' => '2099-01-01'), now)
  end
  def test_lastmod_accepts_only_valid_explicit_dates
    assert_equal '2026-01-03', PublicSEO.lastmod('updated' => '2026-01-03', 'date' => '2020-01-01')
    assert_equal '2020-01-01', PublicSEO.lastmod('updated' => 'invalid', 'date' => '2020-01-01')
    assert_equal '2026-07-22T15:45:46+09:00', PublicSEO.lastmod('updated' => '2026-07-22 15:45:46 +0900')
    [{}, {'end_date' => '2026-01-03'}, {'date' => '2026-02-30'}, {'date' => 'tomorrow'}, {'date' => '2026-01-01 garbage'}].each { |data| assert_nil PublicSEO.lastmod(data) }
  end
  def test_supported_quoted_future_updated_formats_are_not_public
    now = Time.utc(2026, 10, 2)
    ['2099-01-01T00:00:00+0900', '2099-1-1', '2099-01-01 00:00:00 +09:00'].each do |value|
      refute PublicSEO.public_document?(doc('date' => '2020-01-01', 'updated' => value), now), value
    end
  end
  def test_date_normalization_preserves_truthful_lastmod
    {
      '2020-1-2' => '2020-01-02',
      '2020-01-02T03:04:05+0900' => '2020-01-02T03:04:05+09:00',
      '2020-1-2 03:04:05 +09:00' => '2020-01-02T03:04:05+09:00',
      '2020-01-02 03:04:05 +0900' => '2020-01-02T03:04:05+09:00',
      '2020-02-29T03:04:05Z' => '2020-02-29T03:04:05Z',
      '2020-1-2T03:04:05.123+09:00' => '2020-01-02T03:04:05.123+09:00'
    }.each do |value, expected|
      assert_equal expected, PublicSEO.valid_date(value), value
      assert_equal expected, PublicSEO.lastmod('updated' => value, 'date' => '2019-01-01'), value
      assert PublicSEO.public_document?(doc('updated' => value), Time.utc(2026, 10, 2)), value
    end
    ['2026-2-30', '2026-02-30T00:00:00+0900', '2026-02-30 00:00:00 +09:00',
     '2025-2-29', '2026-13-1', '2026-1-0', '2020-01-02T24:00:00Z',
     '2020-01-02T03:60:00Z', '2020-01-02T03:04:60Z', 'tomorrow', '2020-1-2 garbage'].each do |value|
      assert_nil PublicSEO.valid_date(value), value
      assert_nil PublicSEO.lastmod('updated' => value), value
      assert_equal '2019-01-01', PublicSEO.lastmod('updated' => value, 'date' => '2019-01-01'), value
    end
  end
  def test_encoding_and_redirect_fragment_exclusions
    site = OpenStruct.new(config: {'url' => 'https://currenjin.github.io', 'baseurl' => ''})
    assert_equal 'https://currenjin.github.io/reviews/%ED%95%9C%EA%B8%80%20%26%20test/', PublicSEO.canonical(site, '/reviews/한글 & test/')
    assert_nil PublicSEO.canonical(site, '/posts/#what-am-i')
    assert_nil PublicSEO.canonical(site, '/books/')
    assert_nil PublicSEO.canonical(site, '/wiki/')
  end
  def test_complete_set_dedup_and_preserved_archive_boundary
    wiki = [doc({}, '/wiki/index/'), doc({}, '/wiki/public/'), doc({'public' => false}, '/wiki/private/')]
    reviews = [doc({}, '/reviews/legacy/'), doc({'draft' => true}, '/reviews/draft/')]
    archive = [doc({'public' => true}, '/posts/article/'), doc({'public' => true}, '/posts/chapters/published/')]
    pages = %w[/ /posts/ /reviews/ /graph/ /tag/ /books/ /wiki/ /search/].map { |url| doc({}, url) }
    site = OpenStruct.new(time: Time.utc(2026, 10, 2), config: {'url' => 'https://currenjin.github.io', 'archive_documents' => archive}, collections: {'wiki' => OpenStruct.new(docs: wiki), 'reviews' => OpenStruct.new(docs: reviews)}, pages: pages)
    PublicSEO.prepare(site)
    expected = %w[/ /wiki/index/ /wiki/public/ /reviews/legacy/ /posts/article/ /posts/chapters/published/ /posts/ /reviews/ /graph/ /tag/].map { |url| 'https://currenjin.github.io' + url }
    assert_equal expected.sort, site.config.fetch('public_sitemap').map { |entry| entry['loc'] }.sort
    assert_equal 2, site.collections['wiki'].docs.size
    assert_equal 1, site.collections['reviews'].docs.size
    assert_same archive, site.config['archive_documents']
  end
end
