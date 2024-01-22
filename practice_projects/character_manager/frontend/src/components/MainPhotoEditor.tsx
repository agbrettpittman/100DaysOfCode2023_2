import AvatarEditor from 'react-avatar-editor'
import styled from 'styled-components'
import Dropzone from 'react-dropzone'
import { useState } from 'react'
import Slider from '@mui/material/Slider';

const StyledDropzone = styled(Dropzone)`
    grid-area: avatar;
    width: 50px;
    height: 50px;
`

const Wrapper = styled.div`
    grid-area: avatar;
    position: relative;
`

const RemoveButton = styled.button`
    position: absolute;
    top: 2px;
    right: 2px;
    opacity: 0.7;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 1.5em;
    aspect-ratio: 1;
    background-color: ${({ theme }) => theme.palette.error.main};
    color: ${({ theme }) => theme.palette.error.contrastText};
    border-radius: 4px;
    :hover {
        opacity: 1;
    }
`;

type ComponentProps = {
    image?: File | string
    onChange?: (image: File) => void
    onRemove?: () => void
}

export default function MainPhotoEditor({image = "", onChange = () => {}, onRemove = () => {}}: ComponentProps) {

    const [Scale, setScale] = useState(1)

    function handleDrop(acceptedFiles: File[]) {
        onChange(acceptedFiles[0])
    }

    return (
        <Wrapper>
            <StyledDropzone
                onDrop={(dropped) => handleDrop(dropped)}
                noClick
                noKeyboard
            >
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()}>
                        <AvatarEditor 
                            width={80} height={80} border={10}
                            image={image} scale={Scale}
                        />
                        <input {...getInputProps()} />
                    </div>
                )}
            </StyledDropzone>
            {image &&
                <Slider aria-label='image zoom' value={Scale} onChange={(_, value) => setScale(value as number)} min={1} max={5} step={0.1} />
            }
            {image &&
                <RemoveButton onClick={onRemove}>X</RemoveButton>
            }
        </Wrapper>
    )
}
