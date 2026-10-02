"""AC 2 metadata regression tests; read-only, no Jekyll/cache writes.

Run: PYTHONDONTWRITEBYTECODE=1 python3 tests/test_public_content_seo.py
Ruby unit tests exercise the production metadata builder without requiring Jekyll.
A full rendered-site build is a separate required integration check.
"""
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def descriptions(cases):
    program = r'''
require 'json'
module Jekyll
  module Hooks
    def self.register(*args, &block); end
  end
end
load ARGV.fetch(0)
puts JSON.generate(JSON.parse(STDIN.read).map { |entry|
  PageMetadata.description(entry.fetch('data'), entry.fetch('body', ''), 'Site fallback')
})
'''
    result = subprocess.run(['ruby', '-e', program, str(ROOT / '_plugins/page_metadata.rb')],
                            input=json.dumps(cases), capture_output=True, text=True)
    if result.returncode:
        raise AssertionError(result.stderr)
    return json.loads(result.stdout)


class MetadataTests(unittest.TestCase):
    def test_explicit_description_then_summary(self):
        self.assertEqual(descriptions([
            {'data': {'seo_description': ' Explicit & "quoted" ', 'summary': 'ignored'}},
            {'data': {'seo_description': ' ', 'summary': 'Existing summary'}},
        ]), ['Explicit & "quoted"', 'Existing summary'])

    def test_plain_text_body_not_markdown_code_or_images(self):
        body = '''# Navigation heading
{:toc}
```ruby
SECRET_CODE
```
![SECRET_IMAGE](https://example.org/image)
<script>SECRET_SCRIPT</script>
<style>SECRET_STYLE</style>
본문의 **실제 설명**은 [원문](https://example.org)과 [[java]]{자바}를 사용한다.
이 설명은 기존 문서에서 추출하며 `CODE_TOKEN`을 포함하지 않는다.
'''
        value = descriptions([{'data': {'layout': 'wiki', 'title': '문서'}, 'body': body}])[0]
        self.assertIn('본문의 실제 설명은 원문과 자바를 사용한다.', value)
        for forbidden in ['SECRET', 'Navigation heading', 'toc', 'CODE_TOKEN', '**', '[[', 'https://']:
            self.assertNotIn(forbidden, value)

    def test_empty_review_uses_only_existing_fields(self):
        value = descriptions([{'data': {'layout': 'review', 'title': '후유증',
            'author': '김선권', 'type': 'webtoon', 'genre': '웹툰, 스릴러',
            'rating': 3.5, 'status': 'finished'}}])[0]
        self.assertEqual(value, '후유증 · 김선권 · webtoon · 웹툰, 스릴러')
        self.assertNotIn('finished', value)
        self.assertNotIn('3.5', value)

    def test_real_review_body_precedes_metadata(self):
        body = '작품에 대해 실제로 작성된 감상 문장이다. 메타데이터보다 본문을 우선해서 설명으로 사용한다.'
        self.assertEqual(descriptions([{'data': {'layout': 'review', 'title': '제목'}, 'body': body}]), [body])

    def test_short_or_template_only_body_does_not_invent_commentary(self):
        self.assertEqual(descriptions([
            {'data': {'layout': 'wiki'}, 'body': '# Title\n```\nsecret\n```'},
            {'data': {'layout': 'default'}, 'body': '<div>{% for review in site.reviews %}{{ review.title }}{% endfor %}</div>'},
            {'data': {'layout': 'review', 'title': '제목'}, 'body': '짧음'},
        ]), ['Site fallback', 'Site fallback', '제목'])

    def test_text_is_bounded_and_html_decoded(self):
        value = descriptions([{'data': {'layout': 'post'}, 'body': '<p>A &amp; B &quot;C&quot; ' + 'existing words ' * 40 + '</p>'}])[0]
        self.assertTrue(value.startswith('A & B "C"'))
        self.assertLessEqual(len(value), 160)

    def test_head_uses_one_shared_escaped_metadata_include(self):
        shared = (ROOT / '_includes/seo-meta.html').read_text()
        self.assertIn('page.canonical_url', shared)
        self.assertIn('absolute_url | uri_escape', shared)
        self.assertEqual(shared.count('rel="canonical"'), 1)
        for key in ['description', 'og:description', 'twitter:description']:
            self.assertRegex(shared, rf'(?:name|property)="{key}" content="{{{{ meta_description \| escape }}}}"')
        for key in ['og:title', 'twitter:title']:
            self.assertRegex(shared, rf'(?:name|property)="{key}" content="{{{{ meta_title \| escape }}}}"')
        self.assertIn('<title>{{ meta_title | escape }}</title>', shared)
        self.assertIn('content="{{ meta_canonical | escape }}"', shared)
        for path in ['_includes/head.html', '_layouts/graph.html']:
            template = (ROOT / path).read_text()
            self.assertEqual(template.count('{% include seo-meta.html %}'), 1)
            self.assertNotIn('rel="canonical"', template)

    def test_books_redirect_has_only_head_canonical_override(self):
        text = (ROOT / 'books.md').read_text()
        self.assertIn('canonical_url: /reviews/', text)
        self.assertNotIn('rel="canonical"', text)
        self.assertIn('content="0; url=/reviews/"', text)
        self.assertIn("window.location.replace('/reviews/');", text)

    def test_index_descriptions_use_existing_page_structure(self):
        self.assertEqual(descriptions([
            {'data': {'layout': 'home'}},
            {'data': {'layout': 'reviews'}},
            {'data': {'layout': 'wikiindex'}},
            {'data': {'layout': 'default', 'url': '/posts/'}},
        ]), ['Site fallback', '책·음악·영상·웹툰 등 작품 리뷰 목록',
             '공개 위키 문서 목록', '글과 연재 시리즈 목록'])

    def test_metadata_hook_preserves_authored_data_and_body(self):
        program = r'''
require 'json'
require 'ostruct'
module Jekyll
  module Hooks
    def self.register(owners, event, &block)
      raise 'wrong owners' unless owners == [:pages, :documents]
      raise 'wrong event' unless event == :pre_render
      @callback = block
    end
    def self.callback; @callback; end
  end
end
load ARGV.fetch(0)
data = {'layout' => 'review', 'title' => 'Actual', 'rating' => 4.5, 'type' => 'book', 'status' => 'finished'}
original = data.dup
body = ''
page = OpenStruct.new(data: data, content: body, site: OpenStruct.new(config: {'description' => 'Fallback'}))
payload = {'page' => data.merge('url' => '/reviews/actual/')}
Jekyll::Hooks.callback.call(page, payload)
raise 'Liquid snapshot description missing' unless payload['page']['meta_description'] == 'Actual · book'
raise 'content mutated' unless page.content == body
raise 'fields mutated' unless page.data.reject { |k, _| k == 'meta_description' } == original
raise 'description missing' unless page.data['meta_description'] == 'Actual · book'
puts 'hook preservation passed'
'''
        result = subprocess.run(['ruby', '-e', program, str(ROOT / '_plugins/page_metadata.rb')],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('hook preservation passed', result.stdout)

    def test_real_review_sources_produce_grounded_descriptions(self):
        program = r'''
require 'json'
require 'yaml'
require 'date'
module Jekyll
  module Hooks
    def self.register(*args, &block); end
  end
end
load ARGV.fetch(0)
root = ARGV.fetch(1)
counts = Hash.new(0)
Dir.glob(File.join(root, '_reviews', '*.md')).each do |path|
  source = File.read(path)
  parts = source.split(/^---\s*$\n?/, 3)
  raise "missing frontmatter: #{path}" unless parts.length == 3
  data = YAML.load(parts[1])
  body = parts[2]
  value = PageMetadata.description(data, body, 'UNSUPPORTED_SITE_FALLBACK')
  raise "ungrounded fallback: #{path}" if value == 'UNSUPPORTED_SITE_FALLBACK' || value.empty?
  expected = data['seo_description'].to_s.strip
  expected = data['summary'].to_s.strip if expected.empty?
  if expected.empty?
    text = PageMetadata.plain_text(body)
    if text.length >= 30
      raise "not extracted from body: #{path}" unless text.start_with?(value.delete_suffix('…'))
      counts['body'] += 1
    else
      fields = %w[title author type genre].map { |key| data[key].to_s.strip }.reject(&:empty?)
      raise "invented metadata: #{path}" unless value == fields.join(' · ')
      counts['metadata'] += 1
    end
  else
    raise "summary changed: #{path}" unless value == expected
    counts['explicit'] += 1
  end
end
raise 'no real reviews tested' if counts.values.sum.zero?
puts JSON.generate(counts)
'''
        result = subprocess.run(['ruby', '-e', program,
                                 str(ROOT / '_plugins/page_metadata.rb'), str(ROOT)],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        counts = json.loads(result.stdout)
        self.assertGreater(sum(counts.values()), 0)
        print('실제 리뷰 description 근거 집계:', counts)

    def test_content_and_design_are_not_changed(self):
        result = subprocess.run(['git', 'diff', '--exit-code', 'HEAD', '--',
            '_wiki', '_reviews', '_articles', '_chapters', '_data', 'css', '_sass', 'js',
            '_plugins/archive.rb'], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main(verbosity=2)
