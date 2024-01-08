import React, {useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';
import { Box } from '@mui/material';

type WrapperProps = {
    hasContents: boolean
    singleFile: boolean
}

type FilesType = (File & {preview?:string})[];

type ComponentProps = {
    maxFiles?: number
    onChange?: (files: FilesType) => void
    label?: string
    initialFiles?: FilesType
}



const Wrapper = styled(Box)<WrapperProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    border-width: 2px;
    border-radius: 2px;
    border-color: #4d4d4d;
    border-style: dashed;
    background-color: #f9f9f9;
    color: #4d4d4d;
    opacity: ${({ hasContents }:{ hasContents: boolean }) => hasContents ? 1 : 0.5};
    position: ${({ singleFile }:{ singleFile: boolean }) => singleFile ? 'relative' : 'unset'};
    outline: none;
    transition: border .24s ease-in-out;
    border-radius: 8px;
    width: 10vw;
    aspect-ratio: 1;
    :hover {
        opacity: 1;
    }
`;

const ThumbsContainer = styled.aside`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`;

const Thumb = styled.div`
    display: 'inline-flex';
    border-radius: 2;
    border: '1px solid #eaeaea';
    margin-bottom: 8;
    margin-right: 8;
    width: 100;
    height: 100;
    padding: 4;
    box-sizing: 'border-box';
    position: ${({ singleFile }:{ singleFile: boolean }) => singleFile ? 'unset' : 'relative'};
    `

const ThumbInner = styled.div`
    display: flex;
    min-width: 0;
    overflow: hidden;
    padding: 8px;
`;

const PreviewImg = styled.img`
    display: block;
    width: auto;
    height: auto;
    max-width: calc(10vw - 16px);
    max-height: calc(10vw - 16px);
`;

const FileDropzone = styled.div`
    height: ${({ filesUploaded }:{ filesUploaded: number }) => filesUploaded ? 'unset' : '100%'};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
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

export default function FileUploader({maxFiles = 1, onChange, label = "Add an image", initialFiles = [], ...props}: ComponentProps) {
    const [files, setFiles] = useState<FilesType>([]);
    const {getRootProps, getInputProps} = useDropzone({
        accept: {
        'image/*': []
        },
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        }
    });

    useEffect(() => {
        if (initialFiles.length) {
            let FileWithoutPreviewFound = false;
            const NewFiles = initialFiles.map(file => {
                if (!file.preview) {
                    FileWithoutPreviewFound = true;
                    return Object.assign(file, {
                        preview: URL.createObjectURL(file)
                    });
                }
                return file;
            });
            if (FileWithoutPreviewFound) setFiles(NewFiles);
            else return;
        }
    }, [initialFiles])

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        return () => files.forEach(file => {
            if (file.preview) URL.revokeObjectURL(file.preview)
        });
    }, []);

    useEffect(() => {
        if (onChange) onChange(files);
    }, [files])

    console.log(maxFiles)
    
    const FilePreviews = files.map(file => (
        <Thumb key={file.name} singleFile={maxFiles === 1}>
            <ThumbInner>
                <PreviewImg
                    src={file.preview}
                    onLoad={() => { if (file.preview) URL.revokeObjectURL(file.preview) }}
                />
            </ThumbInner>
            <RemoveButton onClick={() => setFiles(files.filter(f => f.name !== file.name))}>X</RemoveButton>
        </Thumb>
    ));

    const CanAddMoreFiles = !files || !files.length || files.length < maxFiles;

    return (
        <Wrapper hasContents={files.length > 0} singleFile={maxFiles === 1} {...props}>
            {CanAddMoreFiles &&
                <FileDropzone {...getRootProps({className: 'dropzone'})} filesUploaded={files.length} aria-label={label}>
                    <input {...getInputProps()} />
                    <p>Add an image</p>
                </FileDropzone>
            }
            <ThumbsContainer>
                {FilePreviews}
            </ThumbsContainer>
        </Wrapper>
    );
}