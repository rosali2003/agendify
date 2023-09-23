import React from "react";
import styles from "./Button.module.css";

export enum Sizes {
    Small, Large
}

export enum Colors {
    Primary, Secondary
}

interface ButtonProps {
    color?: Colors
    size?: Sizes;
    children?: React.ReactNode;
    onClick?(evt?: React.MouseEvent<HTMLButtonElement>): void;
}

const Button: React.FC<ButtonProps> = ({color, size, children, onClick}) => {
    return (
        <button onClick={onClick} className={color === Colors.Primary ? styles.PrimaryButton : styles.SecondaryButton}>{children}</button>
    )
    
}

export default Button;