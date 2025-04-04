"use client";
import { useEffect } from "react";
import Image from "next/image";
import Button from "@/_components/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <main
            tabIndex={-1}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                padding: "24px",
                textAlign: "center",
                boxSizing: "border-box",
                backgroundColor: "var(--background-color)",
                color: "var(--on-background-color)"
            }}
        >
            <Image
                src="/error.svg"
                width="99"
                height="33"
                alt=""
                priority={true}
                style={{
                    height: "auto",
                    width: "200px"
                }}
            ></Image>
            <h1>Flûte !</h1>
            <p>Quelque chose s&apos;est mal passé...</p>
            <Button onClick={() => reset()}>Recharger l&apos;application</Button>
        </main>
    )
}