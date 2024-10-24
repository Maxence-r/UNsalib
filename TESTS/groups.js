// Get groups from edt website

function getPage() {
    const request = new Request("https://example.com", {
        method: "POST",
        body: '{"foo": "bar"}',
    });

    const url = request.url;
    const method = request.method;
    const credentials = request.credentials;
    const bodyUsed = request.bodyUsed;
    fetch(request)
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Something went wrong on API server!");
            }
        })
        .then((response) => {
            console.debug(response);
            // …
        })
        .catch((error) => {
            console.error(error);
        });
}
