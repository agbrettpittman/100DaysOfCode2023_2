import { CallSplit } from "styled-icons/material-rounded";
import { SlashLg } from "styled-icons/bootstrap";
import styled from "styled-components";

const StyledWrapper = styled.div<{size: number}>`
    position: relative;
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
`
    
const StyledSlashLg = styled(SlashLg)`
    position: absolute;
    top: 0;
    left: 0;
    rotate: 90deg;
    color: ${({ theme }) => theme.palette.text.secondary};
`

const StyledCallSplit = styled(CallSplit)`
    position: absolute;
    top: ${({ offset }) => offset || 0};
    left: ${({ offset }) => offset || 0};
    color: ${({ theme }) => theme.palette.text.secondary};
`


export default function NotForkable({size = 24, ...props}) {
    const SlashSize = `${size}px`
    const CallSplitSize = `${Math.floor(size * 0.8)}px`
    const CallSplitOffsets = `${Math.floor(size * 0.1)}px`
  return (
    <StyledWrapper {...props} size={size}>
        <StyledSlashLg size={SlashSize} />
        <StyledCallSplit size={CallSplitSize} offset={CallSplitOffsets} />
    </StyledWrapper>
  )
}