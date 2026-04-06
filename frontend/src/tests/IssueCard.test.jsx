import React from 'react';
import { render, screen } from '@testing-library/react';
import IssueCard from '../components/IssueCard';
import { describe, it, expect, vi } from 'vitest';

describe('IssueCard', () => {
    const mockIssue = {
        title: "Test Security Issue",
        description: "Mock security flaw found",
        severity: "critical",
        category: "security",
        code_before: "query = f'SELECT * FROM'",
        code_after: "query = 'SELECT * FROM ...'"
    };

    it('renders the title and severity badge in collapsed state', () => {
        render(<IssueCard issue={mockIssue} index={0} expanded={false} onToggle={vi.fn()} />);

        expect(screen.getByText('Test Security Issue')).toBeInTheDocument();
        expect(screen.getByText('critical')).toBeInTheDocument();
        expect(screen.getByText('security')).toBeInTheDocument();
    });

    it('renders description and fix suggestion when expanded', () => {
        render(<IssueCard issue={mockIssue} index={0} expanded={true} onToggle={vi.fn()} />);

        expect(screen.getByText('Test Security Issue')).toBeInTheDocument();
        expect(screen.getByText('Mock security flaw found')).toBeInTheDocument();
        expect(screen.getAllByText('critical')[0]).toBeInTheDocument();
    });
});
