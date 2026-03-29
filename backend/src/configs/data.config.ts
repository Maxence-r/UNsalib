const dataConfig = {
    baseUrl: "https://edt-v2.univ-nantes.fr",
    baseUrlCelcat: "https://edt.univ-nantes.fr",
    campuses: [
        {
            name: "Tertre",
            sectors: [
                {
                    id: "droit",
                    univId: "droit",
                    celcatId: "droit",
                },
                { id: "fle", univId: "i-fle", celcatId: "fle" },
            ],
        },
        {
            name: "Lombarderie",
            sectors: [
                {
                    id: "sciences",
                    univId: "sciences",
                    celcatId: "sciences",
                },
            ],
        },
    ],
};

export { dataConfig };
