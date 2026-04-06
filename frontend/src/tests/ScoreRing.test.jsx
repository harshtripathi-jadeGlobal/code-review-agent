import React from 'react';
import { render, screen } from '@testing-library/react';
import ScoreRing from '../components/ScoreRing';
import { describe, it, expect } from 'vitest';

describe('ScoreRing Component', () => {
    it('renders the score correctly inside the ring', () => {
        render(<ScoreRing score={85} />);
        expect(screen.getByText('85')).toBeInTheDocument();
    });
});
