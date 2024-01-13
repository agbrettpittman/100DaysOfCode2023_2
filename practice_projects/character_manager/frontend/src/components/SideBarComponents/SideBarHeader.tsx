import { Button } from "@mui/material";
import { Form, useSubmit, useNavigation, useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useEffect } from "react";
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e3e3e3;

    form {
        position: relative;
    }
`

const SearchInput = styled.input`
    width: 100%;
    padding-left: 2rem;
    background-image: ${({ loading }: { loading: boolean }) => 
        loading ? "none" 
        : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='%23999' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' /%3E%3C/svg%3E")`
    };
    background-repeat: no-repeat;
    background-position: 0.625rem 0.75rem;
    background-size: 1rem;
    position: relative;
`

const SearchSpinnerAnimation = keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
`

const SearchSpinner = styled.div`
    width: 1rem;
    height: 1rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23000' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9' /%3E%3C/svg%3E");
    animation: ${SearchSpinnerAnimation} 1s infinite linear;
    position: absolute;
    left: 0.625rem;
    top: 0.75rem;
`

const SROnlyDiv = styled.div`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
`

export default function SideBarHeader() {

    const [searchParams, setSearchParams] = useSearchParams()
    const navigation = useNavigation();
    const submit = useSubmit();

    useEffect(() => {
        const SearchInput = document.getElementById("q") as HTMLInputElement;
        if (!SearchInput) return;
        SearchInput.value = searchParams.get("q") || "";
    }, [searchParams]);

    const DecodedSearchParams = navigation.location && new URLSearchParams(navigation.location.search)
    const Searching =  DecodedSearchParams && DecodedSearchParams.get("q") !== null;

    function searchSubmit(e: React.ChangeEvent<HTMLInputElement>) {
        const isFirstSearch = searchParams.get("q") === null;
        submit(e.currentTarget.form, {
            replace: !isFirstSearch,
        });
    }

    return (
        <Wrapper>
            <Form id="search-form" role="search">
                <SearchInput
                    id="q"
                    aria-label="Filter..."
                    placeholder="Filter..."
                    type="search"
                    name="q"
                    defaultValue={searchParams.get("q") || ""}
                    onChange={searchSubmit}
                    loading={Boolean(Searching)}
                />
                    
                <SearchSpinner
                    id="search-spinner"
                    aria-hidden
                    hidden={!Searching}
                />
                <SROnlyDiv
                    className="sr-only"
                    aria-live="polite"
                ></SROnlyDiv>
            </Form>
            <Link to="/Characters/create">
                <Button variant="contained">
                    New
                </Button>
            </Link>
        </Wrapper>
    )
}