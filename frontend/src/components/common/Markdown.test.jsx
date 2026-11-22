import React from 'react';
import { render, screen } from '@testing-library/react';
import Markdown, { parseBlocks } from './Markdown';

test('parses lists, headings, code and paragraphs', () => {
  const blocks = parseBlocks('# Title\n\nIntro line\n- one\n- two\n\n1. first\n```\ncode\n```');
  expect(blocks.map((b) => b.type)).toEqual(['heading', 'p', 'ul', 'ol', 'code']);
  expect(blocks[2].items).toEqual(['one', 'two']);
});

test('renders inline formatting and citations without injecting HTML', () => {
  render(<Markdown>{'**Bold** and `code` [1] <img src=x onerror=alert(1)>'}</Markdown>);
  expect(screen.getByText('Bold').tagName).toBe('STRONG');
  expect(screen.getByText('code').tagName).toBe('CODE');
  expect(screen.getByText('[1]').tagName).toBe('SUP');
  expect(document.querySelector('img')).toBeNull();
});
