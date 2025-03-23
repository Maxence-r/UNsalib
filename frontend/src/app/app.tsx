"use client";
import Panel from './panel';
import Calendar from './calendar';
import Modal from "@/components/modal";
import Toast from '@/components/toast';
import { ApiRoomType } from "./_utils/types";
import { useModalStore, useToastStore } from './_utils/store';
import Image from 'next/image';

export default function App({ prefetchedRoomsList }: { prefetchedRoomsList: ApiRoomType[] }) {
    return (
        <main tabIndex={-1} className="main">
            <section className="no-compatible">
                <p>Votre écran est orienté dans le mauvais sens ou trop petit.</p>
            </section>
            <section className="loader">
                <div className="progress">
                    <Image src="/loader.svg" width={808} height={64} alt="Chargement..."></Image>
                </div>
            </section>
            <Panel roomsList={prefetchedRoomsList}></Panel>
            <Calendar></Calendar>
            <Modal isOpened={useModalStore((state) => state.isOpened)} closeFunction={useModalStore((state) => state.close)}>{useModalStore((state) => state.content)}</Modal>
            <Toast show={useToastStore((state) => state.isOpened)} error={useToastStore((state) => state.isError)}>{useToastStore((state) => state.content)}</Toast>
        </main>
    );
}