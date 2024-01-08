import styled from "styled-components";
import _ from "lodash";
import { Box, Button, TextField, Switch, FormControlLabel } from "@mui/material";
import FileUploader from "@/components/FileUploader";

type ComponentProps = {
    index: number
    imageDetails: {
        mainPhoto: boolean;
        caption: string;
        file: File | null;
    }
    onChange: (index: number, key: string, value: any) => void
    onRemove: (index: number) => void
    initialImage?: File & {preview?:string}
}

const Wrapper = styled(Box)`
    display: grid;
    grid-template-areas:
        "image caption"
        "image mainSwitch"
        "image remove";
    gap: 1em;
    width: 100%;
    grid-template-columns: auto 1fr;
`;

const StyledFileUploader = styled(FileUploader)`
    grid-area: image;
`;

const CaptionField = styled(TextField)`
    grid-area: caption;
`;

const MainPhotoSwitch = styled(Switch)`
    grid-area: mainSwitch;
`;

const RemoveButton = styled(Button)`
    grid-area: remove;
    width: fit-content;
`;


export default function CharacterImageInput({ index, imageDetails, onChange, onRemove, initialImage }: ComponentProps) {
    return (
        <Wrapper>
            <StyledFileUploader
                label={`Image ${index}`}
                onChange={(files) => onChange(index, 'file', files)}
                initialFiles={initialImage ? [initialImage] : undefined}
            />
            <CaptionField
                size="small"
                fullWidth
                placeholder="Caption"
                aria-label={`Caption ${index}`}
                onChange={(e) => onChange(index, 'caption', e.target.value)}
                value={imageDetails.caption}
            />
            <FormControlLabel label="Main Photo" control={
                <MainPhotoSwitch
                    checked={imageDetails.mainPhoto}
                    onChange={(e) => onChange(index, 'mainPhoto', e.target.checked)}
                    inputProps={{ 'aria-label': 'Main Photo' }}
                />
            } />
            <RemoveButton 
                variant="text"
                color="error"
                aria-label={`Remove ${index}`}
                onClick={() => onRemove(index)}
            >Remove</RemoveButton>
        </Wrapper>
    )
}
