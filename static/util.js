function sendRequest(url, reqObj) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqObj)
    })
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log(err);
        })
}
