import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardStack } from '../CardStack';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';

const mockDrafts = [
    {
        id: '1',
        email_id: 'e1',
        status: 'PENDING',
        proposed_body: 'Draft 1 Body',
        created_at: '2023-01-01',
        subject: 'Subject 1',
        sender: 'Sender 1'
    },
    {
        id: '2',
        email_id: 'e2',
        status: 'PENDING',
        proposed_body: 'Draft 2 Body',
        created_at: '2023-01-02',
        subject: 'Subject 2',
        sender: 'Sender 2'
    }
];

const Wrapper = ({ children }) => (
    <TamaguiProvider config={config}>
        {children}
    </TamaguiProvider>
);

describe('CardStack', () => {
    it('renders the first draft correctly', () => {
        const { getByText } = render(
            <Wrapper>
                <CardStack drafts={mockDrafts} onApprove={() => { }} onReject={() => { }} />
            </Wrapper>
        );

        expect(getByText('Subject 1')).toBeTruthy();
        expect(getByText('Draft 1 Body')).toBeTruthy();
    });

    it('calls onApprove when Approve button is pressed', () => {
        const onApprove = jest.fn();
        const { getByText } = render(
            <Wrapper>
                <CardStack drafts={mockDrafts} onApprove={onApprove} onReject={() => { }} />
            </Wrapper>
        );

        fireEvent.press(getByText('Approve'));
        expect(onApprove).toHaveBeenCalledWith('1');
    });

    it('calls onReject when Reject button is pressed', () => {
        const onReject = jest.fn();
        const { getByText } = render(
            <Wrapper>
                <CardStack drafts={mockDrafts} onApprove={() => { }} onReject={onReject} />
            </Wrapper>
        );

        fireEvent.press(getByText('Reject'));
        expect(onReject).toHaveBeenCalledWith('1');
    });
});
