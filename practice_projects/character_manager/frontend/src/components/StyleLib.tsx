import styled from 'styled-components';

export const CharacterMainPhoto = styled.img<{ size?: string }>`
    width: ${({ size }) => size ? size : '80px'};
    height: ${({ size }) => size ? size : '80px'};
    object-fit: cover;
    border-radius: 8px;
`