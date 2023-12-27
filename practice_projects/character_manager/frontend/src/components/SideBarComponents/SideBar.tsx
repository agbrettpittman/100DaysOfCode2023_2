import SideBarNav from "@/components/SideBarComponents/SideBarNav";
import SideBarHeader from "@/components/SideBarComponents/SideBarHeader";
import styled from "styled-components";

const Wrapper = styled.div`
    width: 22rem;
    background-color: #f7f7f7;
    border-right: solid 1px #e3e3e3;
    display: flex;
    flex-direction: column;
    padding-left: 2rem;
    padding-right: 2rem;
`

export default function SideBar() {
    return (
        <Wrapper>
            <SideBarHeader />
            <SideBarNav />
        </Wrapper>
    )
}
