import React, {useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';
import { Box } from '@mui/material';

const Wrapper = styled(Box)`
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
    outline: none;
    transition: border .24s ease-in-out;
    border-radius: 8px;
    width: 10vw;
    aspect-ratio: 1;
    cursor: pointer;
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
`

const ThumbInner = styled.div`
    display: flex;
    min-width: 0;
    overflow: hidden;
    padding: 8px;
`;

const PreviewImg = styled.img`
    display: block;
    width: 100%;
    height: 100%;
`;

const FileDropzone = styled.div`
    height: ${({ filesUploaded }:{ filesUploaded: number }) => filesUploaded ? 'unset' : '100%'};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`


export default function FileUploader({maxFiles = 0}) {
    const [files, setFiles] = useState<(File & {preview:string})[]>([]);
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
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, []);
    
    const FilePreviews = files.map(file => (
        <Thumb key={file.name}>
            <ThumbInner>
                <PreviewImg
                    src={file.preview}
                    onLoad={() => { URL.revokeObjectURL(file.preview) }}
                />
            </ThumbInner>
        </Thumb>
    ));

    const CanAddMoreFiles = !files || !files.length || files.length < maxFiles;

    return (
        <Wrapper hasContents={files.length > 0}>
            {CanAddMoreFiles &&
                <FileDropzone {...getRootProps({className: 'dropzone'})} filesUploaded={files.length}>
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