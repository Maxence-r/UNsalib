function showToast(msg, error = false) {
    toast.innerText = msg;
    if (error) {
        toast.style.backgroundColor = '#e64242';
        toast.style.color = '#ffffff';
    } else {
        toast.style.backgroundColor = '#44c235';
        toast.style.color = '#ffffff';
    }
    toast.classList.add('displayed');
    setTimeout(() => {
        toast.classList.remove('displayed');
    }, 4000);
}

function chooseColor(colorList, pickedColors) {
    if (pickedColors.length < colorList.length) {
        pickedColors.push(colorList[pickedColors.length]);
        return [colorList[pickedColors.length], pickedColors];
    } else {
        let randomIndex = Math.floor(Math.random() * colorList.length);
        return [colorList[randomIndex], pickedColors];
    }
}

export { showToast, chooseColor };