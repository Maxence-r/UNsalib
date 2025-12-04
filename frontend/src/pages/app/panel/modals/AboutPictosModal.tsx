import { Users, Monitor, Eye, Lock } from "lucide-react";

import { TextButton } from "../../../../components/button/Button";
import { Modal } from "../../../../components/modal/Modal";
import "./AboutPictosModal.css";

const PICTOS = [
    { desc: "Salle info/vidéo", icon: <Monitor /> },
    { desc: "Salle de visioconférence", icon: <Eye /> },
    { desc: "Salle en îlots", icon: <Users /> },
    { desc: "Salle à badge", icon: <Lock /> },
];

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
            <div className="about-pictos">
                <div className="pictos">
                    {PICTOS.map((picto) => (
                        <div className="option" key={picto.desc}>
                            <p>{picto.desc}</p>
                            {picto.icon}
                        </div>
                    ))}
                </div>

                <TextButton onClick={handleCloseButtonClick} text="Compris !" />
            </div>
        </Modal>
    );
}

export { AboutPictosModal };
