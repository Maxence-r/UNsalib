"use client";
import Button from "@/_components/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function App() {
    return (
        <main tabIndex={-1} className="main new">
            <div className="animation-container">
                <DotLottieReact
                    src="/new-animation.lottie"
                    loop
                    autoplay
                />
            </div>
            <div className="content-container">
                <h1 className="title">UNsalib fait peau neuve&nbsp;!</h1>
                <h3 className="subtitle">Bienvenue sur la version 2.0</h3>
                <div className="features-card">
                    <ul className="features-list">
                        <li className="feature"><i>🌙</i>Mode sombre automatique pour protéger vos yeux</li>
                        <li className="feature"><i>📱</i>Navigation sur mobile comme dans une vrai app avec la prise en charge du bouton de retour</li>
                        <li className="feature"><i>🦾</i>Rapidité et fiabilité accrues grâce à l&apos;utilisation de React</li>
                        <li className="feature"><i>🖥️</i>L&apos;interface que vous connaissez</li>
                    </ul>
                    <Button onClick={() => window.location.href = "/"}>C&apos;est parti !</Button>
                </div>
            </div>
        </main>
    );
}