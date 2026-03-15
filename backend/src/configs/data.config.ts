const dataConfig = {
    baseUrl: "https://edt-v2.univ-nantes.fr",
    baseUrlCelcat: "https://edt.univ-nantes.fr",
    campuses: [
        {
            name: "Lombarderie",
            sectors: [
                {
                    uuid: "sciences-1773608432787",
                    univId: "sciences",
                    celcatId: "sciences",
                },
            ],
        },
        {
            name: "Tertre",
            sectors: [
                {
                    uuid: "droit-1773608432787",
                    univId: "droit",
                    celcatId: "droit",
                },
                { uuid: "fle-1773608432787", univId: "i-fle", celcatId: "fle" },
            ],
        },
    ],
};

export { dataConfig };
