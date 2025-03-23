"use client";
import Button from "@/_components/button";
import Image from "next/image";

export default function NotFound() {
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
                boxSizing: "border-box"
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
            <h1>404</h1>
            <p>Impossible de trouver la ressource demandée.</p>
            <Button onClick={() => { window.location.href = "/" }}>Retourner à l&apos;accueil</Button>
        </main>
    )
}