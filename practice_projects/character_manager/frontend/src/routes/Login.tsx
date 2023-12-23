import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react";
import { loginUser } from "@/apiCalls";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CssBaseline from '@mui/material/CssBaseline';
import Alert from "@mui/material/Alert";
import styled from "styled-components";
import { Divider, Snackbar } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const FormWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
`

export default function Login() {

    const [Authorized, setAuthorized] = useState<boolean | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        checkCurrentAuthStatus();
        const AuthInterval = setInterval(checkCurrentAuthStatus, 1000);
        return () => {
            clearInterval(AuthInterval);
        }
    }, []);

    function checkCurrentAuthStatus() {
        const lsToken = localStorage.getItem("accessToken");
            
        if (!lsToken || !isTokenValid(lsToken)) {
            localStorage.removeItem("accessToken");
            setAuthorized(false);
            return;
        }

        setAuthorized(true);
    }

    function removeSearchParam(key: string) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(key);
        setSearchParams(newParams);
    }

    function isTokenValid(token: string) {
        try {
            // decode the jwt token
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            if (new Date(decodedToken.expiration) < new Date()) {
                return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const updates: { [key: string]: any } = {};

        formData.forEach((value, key) => {
            if (typeof value === 'string' || value instanceof File) {
                updates[key] = value.toString();
            }
        });

        loginUser(updates.username, updates.password).then( (response) => {
            if (!response.data?.loginUser?.accessToken) {
                setAuthorized(false);
                return;
            }
            const AccessToken = response.data.loginUser.accessToken;
            if (!AccessToken || !isTokenValid(AccessToken)) {
                setAuthorized(false);
                return;
            }

            localStorage.setItem("accessToken", AccessToken);
            setAuthorized(true);
        }).catch( (error) => {
            console.log(error);
            setAuthorized(false);
        });
    }

    if (Authorized === true) {
        return <Outlet />
    } else if (Authorized === false) {
        return (
            <Container component="main" >
                <Snackbar 
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    open={searchParams.get("signedUp") === "true"} autoHideDuration={6000}
                    onClose={() => removeSearchParam("signedUp")}
                >
                    <Alert severity="success">You're Signed Up! Now Login</Alert>
                </Snackbar>
                <CssBaseline />
                <Typography component="h1" variant="h2" sx={{mt: 4}} align="center">
                    Lair of the Ancients
                </Typography>
                <FormWrapper sx={{mt: 8,}} maxWidth="xs">
                    <Box onSubmit={handleLogin} component="form" noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal" label="Username" name="username" autoComplete="username"
                            required fullWidth autoFocus
                        />
                        <TextField
                            margin="normal" autoComplete="current-password" required fullWidth
                            name="password" label="Password" type="password"
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }} fullWidth>
                            Login
                        </Button>
                        <Divider>Or</Divider>
                        <Button href="/Signup" variant="outlined" sx={{ mt: 3, mb: 2 }} fullWidth>
                            Sign up
                        </Button>
                    </Box>
                </FormWrapper>
            </Container>
        )
    } else if (Authorized === null) {
        return <div>Loading...</div>
    }
}