import { Users, Monitor, Eye, Lock } from "lucide-react";

import { TextButton } from "../../../../components/button/Button";
import { Modal } from "../../../../components/modal/Modal";

function AboutPictosModal({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const handleCloseButtonClick = () => {
        setIsOpen(false);
    };

    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="pictos">
                <div className="option">
                    <p>Salle info/vidéo</p>
                    <Monitor size={20} />
                </div>
                <div className="option">
                    <p>Salle de visioconférence</p>
                    <Eye size={20} />
                </div>
                <div className="option">
                    <p>Salle en ilot</p>
                    <Users size={20} />
                </div>
                <div className="option">
                    <p>Salle à badge</p>
                    <Lock size={20} />
                </div>

                <TextButton onClick={handleCloseButtonClick} text="Compris !" />
            </div>
        </Modal>
    );
}

export { AboutPictosModal };
