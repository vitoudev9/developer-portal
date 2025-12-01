import { useState } from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
    Container,
    Grid,
    Paper,
    TextField,
    Button,
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';

// --- Styled Components for Visual Appeal ---
// A styled Grid item for the visual side (the "picture")
const VisualGridItem = styled(Grid)(({ theme }) => ({
    height: '100vh', // Full viewport height
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // You would replace this with an actual background image or component
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    // Optional: Hide on small screens to prioritize the form
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));
// A styled Paper component for the form to give it elevation/shadow
const FormPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400, // Optional: keeps the form from getting too wide
}));


export default function KeycloakLoginPage() {
    const configApi = useApi(configApiRef);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const keycloakUrl = "http://localhost:8080";
    const realm = "backstage";
    const clientId = "backstage-client"

    const handleLogin: any = async () => {
        setLoading(true);
        setError('');
        try {
            const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('grant_type', 'password');
            params.append('username', username);
            params.append('password', password);

            const resp = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            if (!resp.ok) {
                throw new Error('Invalid username or password');
            }

            const data = await resp.json();
            // TODO: Store token using Backstage auth APIs or a custom mechanism
            // e.g.: await authApi.signIn(data.access_token);

            console.log('Access Token:', data.access_token);
            window.location.href = '/';
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth={false} disableGutters>
            <Grid container>
                <VisualGridItem
                    item
                    md={8}
                    sx={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div
                        style={{
                            backdropFilter: 'blur(4px)',
                            background: 'rgba(0,0,0,0.35)',
                            padding: '40px',
                            borderRadius: '16px',
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                            Empower Your Workflow
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                            Secure access to your Backstage developer portal.
                        </Typography>
                    </div>
                </VisualGridItem>

                <Grid
                    item
                    xs={12}
                    md={4}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '100vh', md: 'auto' } // Full height on small screens
                    }}
                >
                    <FormPaper elevation={6}> {/* Use FormPaper for the form container */}
                        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                            Corporate Login
                        </Typography>
                        <form onSubmit={handleLogin} style={{ width: '100%' }}>
                            {/* Username Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            {/* Password Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {/* Login Button (on the right side of the form) */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    // Custom styling to push the button to the right
                                    // is usually handled within a specific flex/grid container.
                                    // Here, we use `fullWidth`, which is common for login forms.
                                    // If you specifically need a small button aligned right,
                                    // you'd wrap it in a container with `justifyContent: 'flex-end'`.
                                }}
                            >
                                Log In
                            </Button>
                        </form>
                    </FormPaper>
                </Grid>
            </Grid>
        </Container>
    );
}
