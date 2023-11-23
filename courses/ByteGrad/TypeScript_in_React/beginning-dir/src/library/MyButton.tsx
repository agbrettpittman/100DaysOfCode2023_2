

type MyButtonProps = {
    backgroundColor: string
    fontSize: number
    pillShape: boolean
}

export default function MyButton({ backgroundColor = "steelblue", fontSize = 12, pillShape = false }:MyButtonProps) {
    
    let url = "https://www.google.com";

    let styles = {
        backgroundColor,
        fontSize,
        color: 'white',
        borderRadius: "5px",
    };

    if (pillShape) {
        styles.borderRadius = "50px";
    }
    return <button style={styles}>TypeScript Button</button>
}