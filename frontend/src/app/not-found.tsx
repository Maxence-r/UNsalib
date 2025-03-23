"use client";
import Button from "@/components/button";
import Image from "next/image";

export default function NotFound() {
    return (
        <div id="error-page">
            <Image src="/error.svg" width="99" height="33" alt="" priority={true}></Image>
            <h1>404</h1>
            <p>Impossible de trouver la ressource demandée.</p>
            <Button onClick={() => { window.location.href = "/" }}>Retourner à l'accueil</Button>
        </div>
    )
}