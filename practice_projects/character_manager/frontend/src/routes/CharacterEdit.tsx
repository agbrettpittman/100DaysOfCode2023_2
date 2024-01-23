import { Form, useLoaderData, redirect, useNavigate, useParams } from "react-router-dom";
import { 
    Character as CharacterType, 
    CharacterImage as CharacterImageType,
    CharacterAttribute, Maybe, CharacterUpdateInput,
    CharacterImageDetailsInput
} from "@/__generated__/graphql";
import { getFile, updateCharacter, getCharacter } from "@/apiCalls";
import styled from "styled-components";
import { useState, useContext, useEffect, useRef } from "react";
import _, { initial } from "lodash";
import { Box, Button, Divider, TextField, Typography, ButtonGroup, FormControlLabel, Switch } from "@mui/material";
import { RootContext } from "@routes/Root";
import { getProtectedFileProps } from "@utils/utilities";
import axios from "axios";
import CharacterImageInput from "@components/CharacterImageInput";
import MainPhotoEditor from "@components/MainPhotoEditor";
import AvatarEditor from 'react-avatar-editor'

const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    max-width: 40rem;
    padding: 0 1rem;
    box-sizing: border-box;
    gap: 30px;
`;

const HeaderSection = styled(Box)`
    display:grid;
    grid-template-areas:
        "avatar name"
        "avatar subTitle";
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 1rem;
`



type CharacterImagePropsType = CharacterImageType & {
    file: File | null;
}

export default function EditCharacter() {

    const { characterId } = useParams();
    const [character, setCharacter] = useState({} as CharacterType);
    const { getOwnCharacters } = useContext(RootContext)
    const [CharacterDetails, setCharacterDetails] = useState([{name: '', value: ''}] as CharacterAttribute[]);
    const [CharacterImages, setCharacterImages] = useState([] as CharacterImagePropsType[]);
    const navigate = useNavigate();
    const MainPhotoRef = useRef<AvatarEditor>(null);
    const MainPhotoIndex = CharacterImages.findIndex((image) => image.mainPhoto === true);
    const MainPhoto = MainPhotoIndex === -1 ? null : CharacterImages[MainPhotoIndex];

    useEffect(() => {
        getCharacterData();
    }, [characterId])

    async function getCharacterData() {
        if (!characterId) return;
        const CharacterResponse = await getCharacter(characterId);
        if (!CharacterResponse?.data?.character?._id) return
        let character = CharacterResponse.data.character;
        let newCharacterImages = [] as CharacterImagePropsType[];
        let newCharacterDetails = [] as CharacterAttribute[];
        if (character.images?.length) {
            newCharacterImages = await getCharacterImagesFromServer(character.images);
        } 
        if (character.details?.length) {
            const NullReplacedCharacterAttributes = character.details.map((detail) => {
                if (detail === null) return {name: '', value: ''};
                return detail;
            }) as CharacterAttribute[];
            newCharacterDetails = NullReplacedCharacterAttributes;
        } 

        setCharacter(character);
        setCharacterDetails(newCharacterDetails);
        setCharacterImages(newCharacterImages);
    }

    async function getCharacterImagesFromServer(imagesFromCharacter = [] as Maybe<CharacterImageType>[]) {
        let newCharacterImages = [] as CharacterImagePropsType[];
        for (const [index, image] of imagesFromCharacter.entries()) {
            if (!image?.filename) continue;
            const FallBackAlt = `Image ${index + 1}`;
            const Alt = image?.caption || FallBackAlt;
            const ProtectedFileProps = await getProtectedFileProps(image?.filename || "", Alt);
            console.log(ProtectedFileProps)
            try {
                const RetrievedFile = await getFile(image.filename);
                if (!RetrievedFile.data) continue;
                const SuggestedFileName = RetrievedFile.headers['x-suggested-filename'];
                const CreatedFile = new File([RetrievedFile.data], SuggestedFileName, { type: RetrievedFile.headers['content-type'] });
                console.log(CreatedFile)
                // verify data is a file
                newCharacterImages.push({
                    ...image,
                    file: CreatedFile,
                })

            } catch (error) {
                console.log(error);
                newCharacterImages.push({
                    ...image,
                    file: null,
                })
                continue;
            }
        }
        return newCharacterImages
    }

    function changeCharacterImage(index: number, key: string, value: any) {
        if (!CharacterImages || !CharacterImages.length) return;
        if (index === undefined || !key) return;
        if (key !== 'mainPhoto' && key !== 'caption' && key !== 'file') return;
        if (!CharacterImages?.[index]) return;
        let newImages = _.cloneDeep(CharacterImages);
        if (key === 'file') {
            if (value.length) {
                newImages[index]![key] = value[0];
            } else {
                newImages[index]![key] = null;
            }
        } else if (key === 'mainPhoto') {
            if (typeof value !== 'boolean') return;
            if (value === true) {
                newImages = newImages.map((image) => {
                    image.mainPhoto = false;
                    return image;
                });
            }
            newImages[index]![key] = value;
        } else {
            if (typeof value !== 'string') return;
            newImages[index]![key] = value;
        }
        setCharacterImages(newImages);
    }

    function handleCharacterPrivacyChange(e: React.ChangeEvent<HTMLInputElement>) {
        let value = e.target.checked;
        if (value === true) {
            setCharacter({...character, private: true, forkable: false});
        } else {
            setCharacter({...character, private: false});
        }
    }

    function changeCharacterDetail(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number, key: string) {
        if (!CharacterDetails || !CharacterDetails.length) return;
        if (index === undefined || !key) return;
        if (key !== 'name' && key !== 'value') return;
        if (!CharacterDetails?.[index]) return;
        let newDetails = _.cloneDeep(CharacterDetails);
        newDetails[index]![key] = e.target.value;
        setCharacterDetails(newDetails);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const inputValues: CharacterUpdateInput = {
            name: validateFormInput('name'),
            subTitle: validateFormInput('subTitle'),
            description: validateFormInput('description'),
            details: [],
            imageDetails: [] as CharacterImageDetailsInput[],
        };
        let images = [] as File[];

        if (!inputValues.name) throw new Error("Name is required");

        function validateFormInput(input: string): string {
            const Value = formData.get(input);
            if (!Value) return '';
            if (typeof Value !== 'string') return '';
            return Value;
        }
  
        if (CharacterDetails && CharacterDetails.length) {
            inputValues.details = CharacterDetails.map( (detail: Maybe<CharacterAttribute>) => {
                if (!detail?.name || !detail?.value) {
                    return null;
                }
                return {
                    name: detail.name,
                    value: detail.value
                }
            }).filter( (detail: Maybe<CharacterAttribute>) => detail !== null);
        }

        if (CharacterImages && CharacterImages.length) {
            let newImageDetails = [] as CharacterImageDetailsInput[];
            let iterator = 0;

            for (const image of CharacterImages) {
                if (!image.file) continue;
                const NewFileName = `file-${iterator}`;
                newImageDetails.push({
                    mainPhoto: image.mainPhoto,
                    caption: image.caption,
                    filename: NewFileName
                })
                let newFile = null;
                // change the name of the file to be uploaded
                if (image.mainPhoto === true) {
                    try {
                        const CroppedMainPhoto = await GetCroppedMainPhoto();
                        if (CroppedMainPhoto) {
                            newFile = new File([CroppedMainPhoto], NewFileName, {type: image.file.type});
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    try {
                        newFile = new File([image.file], NewFileName, {type: image.file.type});
                    } catch (error) {
                        console.log(error);
                    }
                }

                if (newFile) {
                    images.push(newFile);
                    iterator++;
                }
            }
            inputValues.imageDetails = newImageDetails;
        }

        try {

            if (!character._id) {
                throw new Error("Missing characterId");
            }

            await updateCharacter(character._id, inputValues, images);
            getOwnCharacters();
            navigate(`/Characters/${character._id}`);
        } catch (error) {
            console.log(error);
            return null;
        }
      
    }

    async function GetCroppedMainPhoto(): Promise<Blob | null> {
        if(!MainPhotoRef.current) return null;

        function PromisifiedToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
            return new Promise((resolve) => {
                canvas.toBlob(blob => {
                if (blob) resolve(blob);
                });
            });
        }

        try {
            const canvas = MainPhotoRef.current?.getImage() as HTMLCanvasElement
            const blob = await PromisifiedToBlob(canvas);
            if (blob) return blob;
            else return null;
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    function HandleMainPhotoChange(image: File) {
        let newCharacterImages = _.cloneDeep(CharacterImages);
        if (MainPhotoIndex === -1) {
            newCharacterImages.push({
                mainPhoto: true,
                caption: "",
                file: image
            })
            setCharacterImages(newCharacterImages);
        } else {
            newCharacterImages[MainPhotoIndex].file = image;
            setCharacterImages(newCharacterImages);
        }
    }

    //TODO: Add ability to specify main photo in react-avatar-editor

    return (
        <StyledForm id="contact-form" method="post" onSubmit={handleSubmit}>
            <HeaderSection>
                <MainPhotoEditor 
                    image={MainPhoto?.file || ""} EditorRef={MainPhotoRef}
                    onChange={HandleMainPhotoChange} 
                    onRemove={() => {
                        let newImages = _.cloneDeep(CharacterImages);
                        newImages.splice(MainPhotoIndex, 1);
                        setCharacterImages(newImages);
                    }}
                />
                <TextField
                    placeholder="Name"
                    aria-label="Name"
                    name="name"
                    variant="standard"
                    InputProps={{ style: { fontSize: '2rem' } }}
                    fullWidth
                    value={character.name}
                    onChange={(e) => setCharacter({...character, name: e.target.value})}
                />
                <TextField
                    name="subTitle"
                    placeholder="Subtitle"
                    aria-label="Subtitle"
                    variant="standard"
                    InputProps={{ style: { fontSize: '1.5rem' } }}
                    sx={{ width: '75%' }}
                    value={character.subTitle}
                    onChange={(e) => setCharacter({...character, subTitle: e.target.value})}
                />
            </HeaderSection>
            <Box display={'flex'} flexDirection={'column'}>
                <FormControlLabel 
                    label={<Typography color="text.primary">This Character is private</Typography>}
                    control={
                        <Switch
                            checked={Boolean(character.private)}
                            onChange={handleCharacterPrivacyChange}
                            inputProps={{ 'aria-label': `This Character is ${character.private ? 'private' : 'public'}` }}
                        />
                    } 
                />
                <FormControlLabel 
                    label={<Typography color="text.primary">This Character is forkable</Typography>}
                    control={
                        <Switch
                            checked={Boolean(character.forkable)}
                            onChange={(e) => setCharacter({...character, forkable: e.target.checked})}
                            inputProps={{ 'aria-label': `This Character is ${character.forkable ? 'forkable' : 'not forkable'}` }}
                            disabled={Boolean(character.private)}
                        />
                } />
            </Box>
            <TextField
                name="description"
                multiline
                rows={6}
                placeholder="Description of the character..."
                fullWidth
                InputProps={{ style: { fontSize: '1rem', borderRadius: '8px' } }}
                value={character.description}
                onChange={(e) => setCharacter({...character, description: e.target.value})}
            />
            <Typography variant="h6">Details</Typography>
            {CharacterDetails && CharacterDetails.map((detail: Maybe<CharacterAttribute>, index: number) => {
                return (
                    <Box key={index} alignContent={'center'} justifyContent={'center'} display={'flex'} flexDirection={'row'} gap={'1rem'}>
                        <TextField
                            size="small"
                            placeholder="Attribute"
                            aria-label={`Attribute ${index}`}
                            value={detail?.name}
                            onChange={(e) => changeCharacterDetail(e, index, 'name')}
                        />
                        <TextField
                            size="small"
                            placeholder="Value"
                            aria-label={`Value ${index}`}
                            value={detail?.value}
                            onChange={(e) => changeCharacterDetail(e, index, 'value')}
                        />
                        <Button 
                            variant="text"
                            color="error"
                            aria-label={`Remove ${index}`}
                            onClick={() => {
                                let newDetails = _.cloneDeep(CharacterDetails);
                                newDetails.splice(index, 1);
                                setCharacterDetails(newDetails);
                            }}
                        >Remove</Button>
                        
                    </Box>
                )
            })}
            <Button 
                variant="text"
                color="primary"
                aria-label="Add Detail"
                onClick={() => setCharacterDetails([...CharacterDetails, {name: '', value: ''}])}
            >Add Detail</Button>
            <Typography variant="h6">Pictures</Typography>
            {
                CharacterImages.map((image, index) => {
                    if (image.mainPhoto === true) return null;
                    const CurrImageDetails = {
                        ...image,
                        mainPhoto: image.mainPhoto || false,
                        caption: image.caption || '',
                    }
                    return (
                        <CharacterImageInput
                            key={image.filename} index={index} imageDetails={CurrImageDetails} onChange={changeCharacterImage} 
                            onRemove={(index) => {
                                let newImages = _.cloneDeep(CharacterImages);
                                newImages.splice(index, 1);
                                setCharacterImages(newImages);
                            }}
                            initialImage={image.file || undefined}
                        />
                    )
                })
            }
            <Button 
                variant="text"
                color="primary"
                aria-label="Add Picture"
                onClick={() => setCharacterImages([...CharacterImages, {
                    mainPhoto: false,
                    caption: "",
                    file: null
                }])}
            >Add Picture</Button>
            <Divider sx={{ width: '100%' }} />
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'}>
                <Button 
                    type="submit"
                    variant="contained"
                    aria-label="Save"
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    aria-label="Cancel"
                    onClick={() => navigate(-1)}
                >Cancel</Button>
            </Box>
        </StyledForm>
    );
}