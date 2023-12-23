import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react";
import { loginUser } from "@/apiCalls";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CssBaseline from '@mui/material/CssBaseline';
import styled from "styled-components";

const FormWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
`

export default function Login() {

    const [Authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const AuthInterval = setInterval(() => {
            const lsToken = localStorage.getItem("accessToken");
            
            if (!lsToken || !isTokenValid(lsToken)) {
                setAuthorized(false);
                return;
            }

            setAuthorized(true);
        }, 1000);

        return () => {
            clearInterval(AuthInterval);
        }
    }, []);

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
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <FormWrapper sx={{marginTop: 8,}}>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
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
                            Sign In
                        </Button>
                    </Box>
                </FormWrapper>
            </Container>
        )
    } else if (Authorized === null) {
        return <div>Loading...</div>
    }
}