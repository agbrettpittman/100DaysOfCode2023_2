import { Typography, Container } from "@mui/material";
import styled from "styled-components";

const StyledContainer = styled(Container)`
    opacity: 0.5;
`

export default function Index() {
    return (
        <StyledContainer>
            <Typography component="h1" variant="h3" align='center' sx={{ fontWeight: "lighter", mt:16 }}>Lair of the Ancients</Typography>
            <Typography variant="subtitle1" align='center'>Welcome! You can find your characters on the sidebar and other's in the search bar</Typography>
        </StyledContainer>
    );
}