import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import styled from 'styled-components';

const StyledDialog = styled(Dialog)`
    .MuiDialog-container {
        backdrop-filter: blur(5px);
    }
`

type Props = {
    title?: string;
    handleClose: () => void;
    controls?: React.ReactNode[];
    children?: React.ReactNode;
};

export default function FormDialog({ handleClose, title = "", controls = [], children }: Props) {

    const ButtonBarButtons = [
        <Button onClick={handleClose} key="__cancel_button__">Cancel</Button>,
        ...controls
    ]

  return (
        <StyledDialog
            open={true}
            onClose={handleClose}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
            <DialogActions>
                {ButtonBarButtons}
            </DialogActions>
        </StyledDialog>
  );
}