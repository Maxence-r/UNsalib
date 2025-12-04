import { TextButton } from "../../../../components/button/Button";
import { Modal } from "../../../../components/modal/Modal";

function SafariInstallModal({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="safariInstall">
                <div className="option">
                    <p>1. Cliquez sur le bouton &quot;Partager&quot;</p>
                    <img src="/share.svg" alt="" width={24} height={24}></img>
                </div>
                <div className="option">
                    <p>
                        2. Cliquez sur &quot;Sur l&apos;écran
                        d&apos;accueil&quot;
                    </p>
                    <img src="/add.svg" alt="" width={21} height={22}></img>
                </div>
                <TextButton onClick={() => closeModal()} text="Compris !" />
            </div>
        </Modal>
    );
}

export { SafariInstallModal };
