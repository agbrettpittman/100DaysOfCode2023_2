import React, { useState } from 'react';
import PopupWrapper from './PopupWrapper';
import styled from 'styled-components';
import { Button, Typography } from '@mui/material';

const OpenerDiv = styled.div`
    display: contents;
`

type Props = {
    Opener?: React.ReactNode;
}

const DefaultOpener = <Button variant="contained">Transfer Character</Button>

export default function CharacterTransfer({ Opener = DefaultOpener}: Props) {

    const [open, setOpen] = useState(false);

    if (open) {
        return (
            <PopupWrapper title="Transfer Character" handleClose={() => setOpen(false)}>
                <Typography variant="body1">
                    In order to confirm the transfer of your character, please type "{"<The character's name>"} 
                    to {"<The character's new owner's name>"}" in the box below.
                </Typography>
            </PopupWrapper>
        )
    } else {
        return <OpenerDiv onClick={() => setOpen(true)}>{Opener}</OpenerDiv>
    }
}
