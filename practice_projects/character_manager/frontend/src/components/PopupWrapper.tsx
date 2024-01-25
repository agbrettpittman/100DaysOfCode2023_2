import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
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
            PaperProps={{
                component: 'form',
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries((formData as any).entries());
                    const email = formJson.email;
                    console.log(email);
                    handleClose();
                },
            }}
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