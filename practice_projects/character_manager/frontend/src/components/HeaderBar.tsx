import {useState, MouseEvent, useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import { Menu as MenuIcon} from '@styled-icons/boxicons-regular/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { styled as MuiStyled, alpha } from '@mui/material/styles';
import styled from 'styled-components';
import { Dragon } from 'styled-icons/fa-solid';
import InputBase from '@mui/material/InputBase';
import { Search as SearchIcon} from '@styled-icons/evaicons-solid/Search'
import { logoutUser } from '@/apiCalls';
import { PaddingRight } from 'styled-icons/fluentui-system-filled';
import { useSearchParams } from 'react-router-dom';
import { useCustomNavigate } from '@utils/utilities';

const StyledAppBar = styled(AppBar)`
    height: fit-content;
`

const StyledToolBar = styled(Toolbar)`
    justify-content: space-between;
`

const ProfileDropdownItem = styled(Typography)`
    text-decoration: ${({ disabled }:{ disabled: boolean}) => disabled ? 'line-through' : 'none'};
`

const Search = MuiStyled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: '40%',
    },
}));

const SearchIconWrapper = MuiStyled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = MuiStyled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        PaddingRight: `calc(1em + ${theme.spacing(1)})`,
        transition: theme.transitions.create(['width', 'padding']),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '100%',
        },
        ':focus': {
            paddingLeft: `calc(1em + ${theme.spacing(1)})`,
        },
        ':not(:placeholder-shown)': {
            paddingLeft: `calc(1em + ${theme.spacing(1)})`,
        }
    },
}));


export default function HeaderBar() {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [searchParams, setSearchParams] = useSearchParams()
    const { navigate: Navigate, location } = useCustomNavigate();
    
    const settings = [
        {
            title: 'Profile',
            disabled: true,
        },
        {
            title: 'Account',
            disabled: true,
        },
        {
            title: 'Dashboard',
            disabled: true,
        },
        {
            title: 'Logout',
            disabled: false,
            action: async () => {
                logoutUser().then(() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/';
                }).catch((err) => {
                    console.log(err);
                    alert('Failed to logout');
                });
            }
        },
    ]

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    function handleSearchSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            Navigate('/SearchResults');
        }
    }

    return (
        <StyledAppBar position="static" elevation={0}>
            <Container maxWidth="xl">
                <StyledToolBar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        fontWeight: 'lighter',
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                        }}
                    >
                        <img src="/LotA.png" alt="Logo" width="40px" height="40px" />
                    </Typography>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                        mr: 2,
                        display: { xs: 'flex', md: 'none' },
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                        }}
                    >
                        <Dragon size="30" />
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search other's characters..."
                            inputProps={{ 'aria-label': 'search'}}
                            value={searchParams.get("globalSearch") || ""}
                            onChange={(e) => {
                                searchParams.set("globalSearch", e.target.value);
                                setSearchParams(searchParams);
                            }}
                            onKeyDown={handleSearchSubmit}
                        />
                    </Search>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar alt="Profile Icon" sx={{ bgcolor: 'primary.contrastText', color: 'primary.main' }}/>
                        </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                        {settings.map((setting) => (
                            <MenuItem key={setting.title} onClick={handleCloseUserMenu}>
                                <ProfileDropdownItem 
                                    textAlign="center" disabled={setting.disabled} aria-disabled={setting.disabled} 
                                    onClick={setting.action}
                                >
                                    {setting.title}
                                </ProfileDropdownItem>
                            </MenuItem>
                        ))}
                        </Menu>
                    </Box>
                </StyledToolBar>
            </Container>
        </StyledAppBar>
    );
}