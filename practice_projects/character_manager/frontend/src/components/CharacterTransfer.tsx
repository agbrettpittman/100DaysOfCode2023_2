import React, { useState, useEffect } from 'react';
import PopupWrapper from './PopupWrapper';
import styled from 'styled-components';
import { Button, Typography, TextField, Box } from '@mui/material';
import { Character as CharacterType } from '@/__generated__/graphql';
import { transferCharacter } from '@/apiCalls';

const OpenerDiv = styled.div`
    display: contents;
`

type Props = {
    opener?: React.ReactNode;
    character?: CharacterType
    onSuccess?: () => void;
}


const DefaultOpener = <Button variant="contained">Transfer Character</Button>

export default function CharacterTransfer({ opener = DefaultOpener, character, onSuccess}: Props) {

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [newOwner, setNewOwner] = useState("");
    const [errors, setErrors] = useState({ 
        name: { errorable: false, message: ""},
        newOwner: { errorable: false, message: ""}
    })

    useEffect(() => {
        if (!errors.name.errorable) return
        runNameChecks()
    }, [name])

    useEffect(() => {
        if (!errors.newOwner.errorable) return
        runNewOwnerChecks()
    }, [newOwner])

    useEffect(() => {
        setName("")
        setNewOwner("")
        setErrors({ 
            name: { errorable: false, message: ""},
            newOwner: { errorable: false, message: ""}
        })
    }, [open])

    function runNameChecks() {
        if (name === character?.name) {
            setErrors({...errors, name: { errorable: false, message: ""}})
        } else if (name !== "") {
            setErrors({...errors, name: { errorable: true, message: "Name does not match character name"}})
        } else if (name === "") {
            setErrors({...errors, name: { errorable: true, message: "Name cannot be empty"}})
        }
    }

    function runNewOwnerChecks() {
        if (newOwner === "") {
            setErrors({...errors, newOwner: { errorable: true, message: "New owner cannot be empty"}})
        } else {
            setErrors({...errors, newOwner: { errorable: false, message: ""}})
        }
    }

    function handleSubmission() {
        console.log({name, newOwner, character})
        if (name !== character?.name || newOwner === "" || !character?._id) return
        transferCharacter(character._id, newOwner).then((response) => {
            if (!response.data?.transferCharacter) {
                alert("Character transfer failed")
                return
            }
            if (onSuccess) onSuccess()
        }).catch((err) => {
            console.log(err)
            alert("An error occurred while transferring the character")
        })
    }

    const Controls = [
        <Button variant="contained" onClick={handleSubmission}>Transfer</Button>
    ]


    if (open) {
        return (
            <PopupWrapper title="Transfer Character" handleClose={() => setOpen(false)} controls={Controls}>
                <Box display="flex" flexDirection="column" gap="1rem" sx={{mb: 1}}>
                    <Typography variant="body1">
                        In order to confirm the transfer of your character, please type 
                        <Typography component="span" sx={{fontWeight: "bold", userSelect: "none"}}>
                            {` ${character?.name} `}
                        </Typography>
                        in the 
                        <Typography component="span" sx={{fontStyle: "italic"}}> Character Name </Typography> 
                        field. Then copy and paste the 
                        <Typography component="span" sx={{fontWeight: "bold"}}> ID of the user </Typography> 
                        you are transferring ownership to in the 
                        <Typography component="span" sx={{fontStyle: "italic"}}> New Owner </Typography>
                        field. Finally, click the "Transfer" button.
                    </Typography>
                    <TextField 
                        label="Character Name" variant="standard" onChange={(e) => setName(e.target.value)} 
                        value={name} onBlur={runNameChecks}
                        error={errors.name.errorable && errors.name.message !== ""}
                        helperText={errors.name.message}
                    />
                    <TextField 
                        label="New Owner ID" variant="standard" onChange={(e) => setNewOwner(e.target.value)}
                        value={newOwner} onBlur={runNewOwnerChecks}
                        error={errors.newOwner.errorable && errors.newOwner.message !== ""}
                        helperText={errors.newOwner.message}
                    />
                </Box>
            </PopupWrapper>
        )
    } else {
        return <OpenerDiv onClick={() => setOpen(true)}>{opener}</OpenerDiv>
    }
}
