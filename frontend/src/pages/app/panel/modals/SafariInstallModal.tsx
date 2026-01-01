import { TextButton } from "../../../../components/button/Button";

function SafariInstallModal({ close }: { close?: () => void }) {
    return (
        <div className="safariInstall">
            <div className="option">
                <p>1. Cliquez sur le bouton &quot;Partager&quot;</p>
                <img src="/share.svg" alt="" width={24} height={24}></img>
            </div>
            <div className="option">
                <p>
                    2. Cliquez sur &quot;Sur l&apos;écran d&apos;accueil&quot;
                </p>
                <img src="/add.svg" alt="" width={21} height={22}></img>
            </div>
            <TextButton onClick={close} text="Compris !" />
        </div>
    );
}

export { SafariInstallModal };
