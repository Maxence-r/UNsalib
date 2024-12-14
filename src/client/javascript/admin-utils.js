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

export { showToast };