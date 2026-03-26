/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

const SimpleComponent = () => <div>Hello, Mosque Management System!</div>;

describe('Simple Frontend Test', () => {
  it('renders a greeting', () => {
    const { container } = render(<SimpleComponent />);
    expect(container.textContent).toContain('Hello, Mosque Management System!');
  });
});
