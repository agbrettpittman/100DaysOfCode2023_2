import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createUser } from '@/apiCalls';
import { CreateUserInput } from '@/__generated__/graphql';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SignUp() {

    const navigate = useNavigate();
    const [email, setEmail] = useState<string | null>(null);

    function validateEmail(email: string) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const updates: { [key: string]: any } = {};
            const requiredFields = ['name', 'userName', 'email', 'password'];
    
            formData.forEach((value, key) => {
                if (typeof value === 'string' || value instanceof File) {
                    updates[key] = value.toString();
                }
            });
                
            Object.keys(updates).forEach(key => {
                const Value = (updates as any)[key];
                if (!Value) throw new Error(`Missing ${key}`);
                if (typeof Value !== 'string') throw new Error(`${key} is invalid`);
            })

            

            requiredFields.forEach(field => {
                if (!updates[field]) throw new Error(`Missing ${field}`);
            })
    
            const CreatedUser = await createUser(updates as CreateUserInput);
            if (!CreatedUser?.data?.createUser?._id) throw new Error("Could not be successfully signed up");
    
            navigate(`/?signedUp=true`);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
            <Typography component="h1" variant="h5">
                Sign up
            </Typography>
            <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField 
                            autoComplete="name" name="name" label="Display Name"
                            required fullWidth autoFocus
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            autoComplete="username" name="userName" label="Username"
                            required fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Email Address" name="email" autoComplete="email" type='email'
                            required fullWidth onChange={(e) => setEmail(e.target.value)}
                            error={email !== null && !validateEmail(email)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="password" type="password" autoComplete="new-password" label="Password"
                            required fullWidth
                        />
                    </Grid>
                </Grid>
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, mb: 2 }}>
                    Sign Up
                </Button>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Link href="/" variant="body2">
                            Already have an account? Sign in
                        </Link>
                    </Grid>
                </Grid>
            </Box>
            </Box>
      </Container>
    )
}